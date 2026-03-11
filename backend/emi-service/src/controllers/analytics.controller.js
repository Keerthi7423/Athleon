const aggregationService = require('../services/aggregation.service');
const { getCache, setCache } = require('../utils/redis');

/**
 * 2. API controller logic
 * 5. Redis cache integration
 * 6. Error handling
 */

const getPlayerAnalytics = async (req, res) => {
    try {
        const playerId = req.params.id;
        const cacheKey = `analytics_agg:player:${playerId}`;

        // 5. Redis cache integration - Check Cache
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData
            });
        }

        const data = await aggregationService.getPlayerAnalytics(playerId);

        // Cache the aggregated result with TTL 300s
        await setCache(cacheKey, data, 300);

        res.status(200).json({
            success: true,
            source: 'aggregated',
            data
        });
    } catch (error) {
        // 6. Error handling
        console.error(`[Error] getPlayerAnalytics for ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Internal server error while fetching aggregated player analytics' });
    }
};

const getMatchAnalytics = async (req, res) => {
    try {
        const matchId = req.params.id;
        const cacheKey = `analytics_agg:match:${matchId}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData
            });
        }

        const data = await aggregationService.getMatchAnalytics(matchId);

        await setCache(cacheKey, data, 300);

        res.status(200).json({
            success: true,
            source: 'aggregated',
            data
        });
    } catch (error) {
        console.error(`[Error] getMatchAnalytics for ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Internal server error while fetching aggregated match analytics' });
    }
};

const getTeamAnalytics = async (req, res) => {
    try {
        const teamId = req.params.id;
        const cacheKey = `analytics_agg:team:${teamId}`;

        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData
            });
        }

        const data = await aggregationService.getTeamAnalytics(teamId);

        await setCache(cacheKey, data, 600); // 10 mins

        res.status(200).json({
            success: true,
            source: 'aggregated',
            data
        });
    } catch (error) {
        console.error(`[Error] getTeamAnalytics for ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Internal server error while fetching aggregated team analytics' });
    }
};

module.exports = {
    getPlayerAnalytics,
    getMatchAnalytics,
    getTeamAnalytics
};
