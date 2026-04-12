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
        const keys = await redisClient.keys(pattern); // Lấy thử danh sách key

        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`Deleted keys: ${keys.join(', ')}`);
        } else {
            console.log(`No keys found for pattern: ${pattern}`);
        }
    } catch (error) {
        console.error(`Redis Del Error:`, error);
    }
};

module.exports = {
    get,
    set,
    del,
    delByPattern
};