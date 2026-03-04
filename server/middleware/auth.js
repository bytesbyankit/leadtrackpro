const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * JWT verification middleware.
 * Reads Authorization: Bearer <token>, verifies it, and attaches req.user.
 * Returns 401 if missing or invalid.
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        const message = err.name === 'TokenExpiredError'
            ? 'Token expired. Please log in again.'
            : 'Invalid token.';
        return res.status(401).json({ success: false, message });
    }
}

/**
 * Login handler — checks email + password against env vars.
 * Returns a signed JWT on success, 401 on failure.
 */
async function loginHandler(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required.',
        });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
        console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD_HASH not configured.');
        return res.status(500).json({
            success: false,
            message: 'Server authentication not configured.',
        });
    }

    // Check email (case-insensitive)
    if (email.toLowerCase() !== adminEmail.toLowerCase()) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password.',
        });
    }

    // Check password against bcrypt hash
    const isMatch = await bcrypt.compare(password, adminPasswordHash);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password.',
        });
    }

    // Sign JWT
    const token = jwt.sign(
        { email: adminEmail, role: 'admin' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );

    res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: { email: adminEmail, role: 'admin' },
    });
}

module.exports = { verifyToken, loginHandler };
