const fatigueService = require('../services/fatigue.service');
const { getCache, setCache } = require('../utils/redis');

/**
 * GET /fatigue/player/:id
 * Get player fatigue, utilizing Redis cache
 */
const getPlayerFatigue = async (req, res) => {
    try {
        const playerId = req.params.id;
        const cacheKey = `fatigue:player:${playerId}`;

        // 4. Redis caching integration - check cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData
            });
        }

        const data = await fatigueService.processPlayerFatigue(playerId);

        // 4. Redis caching integration - set cache with TTL (e.g., 300s = 5m)
        await setCache(cacheKey, data, 300);

        res.status(200).json({
            success: true,
            source: 'db',
            data
        });
    } catch (error) {
        // 6. Error handling
        console.error(`[Error] getPlayerFatigue for ${req.params.id}:`, error.message);
        if (error.message.includes('No workload data found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: 'Internal server error while fetching player fatigue' });
    }
};

/**
 * POST /fatigue/calculate
 * Force calculation of fatigue for a player, bypassing cache
 */
const calculateFatigue = async (req, res) => {
    try {
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ success: false, error: 'playerId is required' });
        }

        const data = await fatigueService.processPlayerFatigue(playerId);

        // Update cache after new calculation
        const cacheKey = `fatigue:player:${playerId}`;
        await setCache(cacheKey, data, 300);

        res.status(200).json({
            success: true,
            message: 'Fatigue recalculated successfully',
            data
        });
    } catch (error) {
        // 6. Error handling
        console.error('[Error] calculateFatigue:', error.message);
        res.status(500).json({ success: false, error: 'Internal server error during fatigue calculation' });
    }
};

/**
 * GET /fatigue/team/:id
 * Get fatigue data for an entire team
 */
const getTeamFatigue = async (req, res) => {
    try {
        const teamId = req.params.id;
        const cacheKey = `fatigue:team:${teamId}`;

        // 4. Redis caching integration
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData
            });
        }

        // We fetch team data, then process for each unique player
        const workloadData = await fatigueService.getTeamWorkloadData(teamId);

        // Group by player
        const playersData = {};
        workloadData.forEach(row => {
            if (!playersData[row.player_id]) playersData[row.player_id] = [];
            playersData[row.player_id].push(row);
        });

        const results = [];
        for (const [playerId, matchData] of Object.entries(playersData)) {
            const fatigueScore = fatigueService.calculateFatigueScore(matchData);
            const riskLevel = fatigueService.determineInjuryRisk(fatigueScore);
            results.push({ playerId, fatigueScore, riskLevel });
        }

        const responseData = { teamId, players: results, calculatedAt: new Date().toISOString() };

        // Cache team result for slightly longer, e.g., 600s = 10m
        await setCache(cacheKey, responseData, 600);

        res.status(200).json({
            success: true,
            source: 'db',
            data: responseData
        });

    } catch (error) {
        // 6. Error handling
        console.error(`[Error] getTeamFatigue for ${req.params.id}:`, error.message);
        res.status(500).json({ success: false, error: 'Internal server error while fetching team fatigue' });
    }
};

module.exports = {
    getPlayerFatigue,
    calculateFatigue,
    getTeamFatigue
};
