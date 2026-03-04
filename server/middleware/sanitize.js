const xss = require('xss');

/**
 * Sanitize all string fields in req.body to strip XSS/HTML payloads.
 * Place this middleware BEFORE validation.
 */
function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
}

module.exports = { sanitizeBody };
