const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many failed attempts, please try again later',
        });
    },
});
const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        status: 'error',
        message: 'Too many requests, please try again later',
    },

    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many requests, please try again later',
        });
    },
});

module.exports = {
    authLimiter,
    globalLimiter
};
