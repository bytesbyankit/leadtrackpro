const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const { globalLimiter, leadCreationLimiter } = require('./middleware/rateLimiter');
const { verifyToken, loginHandler } = require('./middleware/auth');
const { sanitizeBody } = require('./middleware/sanitize');
const { leadValidationRules, handleValidationErrors } = require('./middleware/validateLead');
const { appendLead, getAllLeads, updateLead, deleteLead } = require('./services/dbService');

const app = express();
const PORT = process.env.PORT || 4000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ────────────────────────────────────────────────
// Layer 1 — HTTP Security Headers
// ────────────────────────────────────────────────
app.use(helmet());

// Disable ETag to force 200 instead of 304
app.set('etag', false);

// Middleware to prevent caching on API responses
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// ────────────────────────────────────────────────
// Layer 2 — CORS Lockdown
// ────────────────────────────────────────────────
const allowedOrigins = IS_PRODUCTION
    ? (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:4000'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400, // Preflight cache: 24 hours
}));

// ────────────────────────────────────────────────
// Layer 3 — Rate Limiting
// ────────────────────────────────────────────────
app.use(globalLimiter);

// ────────────────────────────────────────────────
// Body Parsing & Parameter Protection
// ────────────────────────────────────────────────
app.use(express.json({ limit: '16kb' }));
app.use(hpp());

// ────────────────────────────────────────────────
// Request Timeout
// ────────────────────────────────────────────────
const timeout = (ms) => (req, res, next) => {
    res.setTimeout(ms, () => {
        if (!res.headersSent) {
            res.status(408).json({ success: false, message: 'Request Timeout' });
        }
    });
    next();
};
app.use(timeout(parseInt(process.env.REQUEST_TIMEOUT) || 30000));

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────

// Health Check (unauthenticated)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ────────────────────────────────────────────────
// Auth Routes (unauthenticated)
// ────────────────────────────────────────────────
const loginLimiter = require('express-rate-limit').rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts. Try again later.' },
});
app.post('/api/auth/login', loginLimiter, loginHandler);

// ────────────────────────────────────────────────
// Protected Routes — JWT required below this point
// ────────────────────────────────────────────────
app.use('/api/leads', verifyToken);

// GET /api/leads — Fetch all leads
app.get('/api/leads', async (req, res, next) => {
    try {
        const leads = await getAllLeads();
        res.json({ success: true, count: leads.length, leads });
    } catch (error) {
        next(error);
    }
});

// POST /api/leads — Append a new lead (stricter rate limit + sanitize + validate)
app.post('/api/leads',
    leadCreationLimiter,
    sanitizeBody,
    leadValidationRules,
    handleValidationErrors,
    async (req, res, next) => {
        try {
            const newLead = await appendLead(req.body);
            res.status(201).json({
                success: true,
                message: 'Lead logged successfully',
                lead: newLead
            });
        } catch (error) {
            next(error);
        }
    }
);

// ────────────────────────────────────────────────
// Layer 7 — Global Error Handler
// ────────────────────────────────────────────────
app.patch('/api/leads/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const updates = req.body;

        const updatedLead = await updateLead(id, updates);
        if (!updatedLead) {
            return res.status(404).json({ success: false, message: 'Lead not found or no updates provided' });
        }
        res.json({ success: true, message: 'Lead updated', lead: updatedLead });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/leads/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const success = await deleteLead(id);
        if (!success) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        res.json({ success: true, message: 'Lead deleted' });
    } catch (error) {
        next(error);
    }
});

// ────────────────────────────────────────────────
// Layer 8 — Global Error Handler
// ────────────────────────────────────────────────
app.use((err, req, res, _next) => {
    // CORS errors
    if (err.message && err.message.includes('not allowed by CORS')) {
        return res.status(403).json({ success: false, message: 'Forbidden: CORS policy' });
    }

    console.error('Unhandled error:', err);

    if (IS_PRODUCTION) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

    // Development: expose full error for debugging
    res.status(500).json({
        success: false,
        message: err.message,
        stack: err.stack,
    });
});

// ────────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`LeadTrack API running on http://localhost:${PORT}`);
    });
}

module.exports = app;
