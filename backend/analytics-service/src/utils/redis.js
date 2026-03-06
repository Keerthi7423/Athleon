const { createClient } = require('redis');
const config = require('../config/env');

let redisClient;

/**
 * 1. Redis connection setup
 * Connects to the Redis server and sets up error handling
 */
const connectRedis = async () => {
    try {
        redisClient = createClient({
            url: config.redis.url
        });

        // 5. Error handling: listen to Redis events
        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
            // In a real application, you might want to trigger alerts here
        });

        redisClient.on('connect', () => {
            console.log('Successfully connected to Redis');
        });

        redisClient.on('reconnecting', () => {
            console.warn('Redis client is reconnecting...');
        });

        await redisClient.connect();

        // Test the connection
        await redisClient.ping();
    } catch (error) {
        console.error('Failed to initialize Redis connection:', error);
        // Depending on the microservice requirement, we might either 
        // want to exit process, or run without cache gracefully
    }
};

/**
 * Ensures Redis is connected before performing an operation.
 * @returns {boolean} True if client is ready
 */
const isReady = () => {
    return redisClient && redisClient.isReady;
};

/**
 * 2. Cache utility functions
 * Fetch data from cache
 * @param {string} key - Redis key to lookup
 * @returns {Promise<any|null>} Parsed JSON data or null if cache miss / error
 */
const getCache = async (key) => {
    if (!isReady()) return null;

    try {
        const data = await redisClient.get(key);
        if (data) {
            console.log(`[Cache Hit] key: ${key}`);
            return JSON.parse(data);
        }
        console.log(`[Cache Miss] key: ${key}`);
        return null;
    } catch (error) {
        // 5. Error handling: Graceful fallback on cache failure
        console.error(`Failed to get cache for key ${key}:`, error);
        // Return null so the application can fallback to DB query
        return null;
    }
};

/**
 * 2. Cache utility functions
 * Save data to cache with a TTL
 * @param {string} key - Redis key
 * @param {any} value - Data to cache (will be JSON stringified)
 * @param {number} ttlInSeconds - Time to live in seconds
 */
const setCache = async (key, value, ttlInSeconds = config.redis.ttl.default) => {
    if (!isReady()) return;

    try {
        const stringifiedValue = JSON.stringify(value);

        // Store results in Redis with TTL using EX (seconds)
        await redisClient.set(key, stringifiedValue, {
            EX: ttlInSeconds
        });

        console.log(`[Cache Set] key: ${key}, ttl: ${ttlInSeconds}s`);
    } catch (error) {
        // 5. Error handling: Non-critical failure, log and proceed
        console.error(`Failed to set cache for key ${key}:`, error);
    }
};

/**
 * Clear a specific cache key or keys matching a pattern
 * @param {string} pattern - Key or pattern to delete
 */
const invalidateCache = async (pattern) => {
    if (!isReady()) return;

    try {
        // If it's a direct key
        if (!pattern.includes('*')) {
            await redisClient.del(pattern);
            console.log(`[Cache Invalidate] key: ${pattern}`);
            return;
        }

        // If it's a pattern, find cursor and delete
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
                console.log(`[Cache Invalidate] pattern keys: ${keys.join(', ')}`);
            }
        } while (cursor !== 0);
    } catch (error) {
        console.error(`Failed to invalidate cache for pattern ${pattern}:`, error);
    }
};

/**
 * Disconnect Redis gracefully
 */
const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        console.log('Redis client disconnected');
    }
};

module.exports = {
    connectRedis,
    getCache,
    setCache,
    invalidateCache,
    disconnectRedis,
    getClient: () => redisClient
};
