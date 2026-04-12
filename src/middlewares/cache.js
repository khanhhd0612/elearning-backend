const cacheService = require('../services/cache.service');
const logger = require('../config/logger');

const cacheMiddleware = (ttl = 3600, { isPrivate = false } = {}) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') return next();

        const userId = req.user?._id?.toString() || 'anonymous';
        const baseKey = isPrivate
            ? `__express__${userId}:${req.originalUrl}`
            : `__express__${req.originalUrl}`;

        try {
            const cachedData = await cacheService.get(baseKey);

            if (cachedData) {
                logger.info(`[Cache] HIT  ${baseKey}`);
                return res.status(cachedData._status || 200).json(cachedData._body);
            }

            logger.info(`[Cache] MISS ${baseKey}`);

            const originalJson = res.json.bind(res);
            res.json = function (body) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    // Lưu kèm status code để restore đúng khi cache hit
                    cacheService.set(baseKey, { _status: res.statusCode, _body: body }, ttl)
                        .catch((err) => logger.error(`[Cache] Set failed: ${err.message}`));
                }
                return originalJson(body);
            };

            next();
        } catch (error) {
            logger.error(`[Cache] Middleware error: ${error.message}`);
            next();
        }
    };
};

module.exports = cacheMiddleware;