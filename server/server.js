require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { leadValidationRules, handleValidationErrors } = require('./middleware/validateLead');
const { appendLead, getAllLeads } = require('./services/dbService');

const app = express();
const PORT = process.env.PORT || 4000;

// Disable ETag to force 200 instead of 304
app.set('etag', false);

// Middleware to prevent caching
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

// Request Timeout Middleware
const timeout = (ms) => (req, res, next) => {
    res.setTimeout(ms, () => {
        if (!res.headersSent) {
            res.status(408).json({ success: false, message: 'Request Timeout' });
        }
    });
    next();
};

app.use(timeout(parseInt(process.env.REQUEST_TIMEOUT) || 30000));
app.use(cors());
app.use(express.json());

// GET /api/leads - Fetch all leads
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await getAllLeads();
        res.json({ success: true, count: leads.length, leads });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch leads' });
    }
});

// POST /api/leads - Append a new lead
app.post('/api/leads', leadValidationRules, handleValidationErrors, async (req, res) => {
    try {
        const newLead = await appendLead(req.body);
        res.status(201).json({
            success: true,
            message: 'Lead logged successfully',
            lead: newLead
        });
    } catch (error) {
        console.error('Error logging lead:', error);
        res.status(500).json({ success: false, message: 'Failed to log lead' });
    }
});

// Basic Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`LeadTrack API running on http://localhost:${PORT}`);
    });
}

module.exports = app;
