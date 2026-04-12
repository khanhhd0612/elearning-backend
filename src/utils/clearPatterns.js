const logger = require("../config/logger");
const cacheService = require('../services/cache.service');

const clearPatterns = (...patterns) => async function () {
    try {
        await Promise.all(patterns.map((p) => cacheService.delByPattern(p)));
        logger.info(`[Cache] Cleared: ${patterns.join(', ')}`);
    } catch (err) {
        logger.error(`[Cache] Failed to clear cache: ${err.message}`);
    }
};

module.exports = clearPatterns