const { redisClient } = require('../config/redis');

/**
 * Lấy dữ liệu từ cache và tự động parse JSON
 */
const get = async (key) => {
    try {
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Redis Get Error (key: ${key}):`, error);
        return null;
    }
};

/**
 * Lưu dữ liệu vào cache
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl - Giây (Mặc định 3600s = 1h)
 */
const set = async (key, value, ttl = 3600) => {
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error(`Redis Set Error (key: ${key}):`, error);
    }
};

/**
 * Xóa 1 key cụ thể
 */
const del = async (key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`Redis Del Error (key: ${key}):`, error);
    }
};

/**
 * Xóa nhiều key theo pattern (Sử dụng SCAN thay cho KEYS để tránh làm chậm Redis)
 */
const delByPattern = async (pattern) => {
    try {
        // Sử dụng SCAN giúp hệ thống không bị "treo" nếu có hàng nghìn key
        let cursor = 0;
        do {
            const reply = await redisClient.scan(cursor, {
                MATCH: pattern,
                COUNT: 100
            });
            cursor = reply.cursor;
            const keys = reply.keys;

            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } while (cursor !== 0);

    } catch (error) {
        console.error(`Redis DelPattern Error (pattern: ${pattern}):`, error);
    }
};

module.exports = {
    get,
    set,
    del,
    delByPattern
};