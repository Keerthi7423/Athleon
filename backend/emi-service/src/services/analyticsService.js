const { getCache, setCache } = require('../utils/redis');
const config = require('../config/env');

// Mock database layer representing the microservice database (e.g., PostgreSQL, MongoDB)
// In a real scenario, this would import models or perform a DB query
const db = {
    playerStats: async (playerId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    playerId,
                    pointsPerGame: (Math.random() * 30 + 5).toFixed(1),
                    assistsPerGame: (Math.random() * 10 + 1).toFixed(1),
                    reboundsPerGame: (Math.random() * 12 + 2).toFixed(1),
                    // Last updated to show cache freshness
                    lastUpdated: new Date().toISOString()
                });
            }, 1500); // simulate slow database query
        });
    },

    matchResults: async (matchId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    matchId,
                    homeTeamScore: Math.floor(Math.random() * 50) + 80,
                    awayTeamScore: Math.floor(Math.random() * 50) + 80,
                    status: 'FINAL',
                    lastUpdated: new Date().toISOString()
                });
            }, 1000); // simulate slow database query
        });
    }
};

/**
 * Service function to get player statistics
 * Demonstrates:
 * 3. Example service using Redis cache
 * - Implement cache check before database query
 * - Store results in Redis with TTL
 * - Handle cache miss and cache hit scenarios
 */
const getPlayerStats = async (playerId) => {
    if (!playerId) {
        throw new Error('Player ID is required');
    }

    // 1. Define the cache key specifically for this entity
    const cacheKey = `analytics:player:${playerId}`;

    try {
        // 2. Cache Check Before Database Query
        // The getCache utility manages the error boundary so DB query happens regardless of Redis status
        const cachedStats = await getCache(cacheKey);

        // 3. Handle Cache Hit
        if (cachedStats) {
            // Adding meta field to demonstrate source
            return {
                ...cachedStats,
                _source: 'redis-cache'
            };
        }

        // 4. Handle Cache Miss - Execute Database Query
        console.log(`[Database Query] Fetching player stats for ID: ${playerId} from source...`);
        const dbStats = await db.playerStats(playerId);

        // 5. Store Results in Redis with TTL
        // The setCache utility manages storing the retrieved data correctly in Redis config.redis.ttl.playerStats
        await setCache(cacheKey, dbStats, config.redis.ttl.playerStats);

        // Return the fresh data
        return {
            ...dbStats,
            _source: 'database'
        };
    } catch (error) {
        // 6. Error Handling gracefully handled if the db fails
        console.error('Failed to get player stats:', error);
        throw new Error('Could not retrieve player statistics');
    }
};

/**
 * Service function to get match results
 * Uses a different configuration TTL specifically for match results 
 */
const getMatchResults = async (matchId) => {
    if (!matchId) {
        throw new Error('Match ID is required');
    }

    const cacheKey = `analytics:match:${matchId}`;

    try {
        const cachedMatch = await getCache(cacheKey);
        if (cachedMatch) {
            return { ...cachedMatch, _source: 'redis-cache' };
        }

        console.log(`[Database Query] Fetching match results for ID: ${matchId} from source...`);
        const dbMatch = await db.matchResults(matchId);

        // Using TTL for match results which might be longer as matches rarely change after status is FINAL
        await setCache(cacheKey, dbMatch, config.redis.ttl.matchResults);

        return { ...dbMatch, _source: 'database' };
    } catch (error) {
        console.error('Failed to get match results:', error);
        throw new Error('Could not retrieve match results');
    }
};

module.exports = {
    getPlayerStats,
    getMatchResults
};
