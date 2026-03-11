const emiService = require('../services/emi.service');
const { getCache, setCache, invalidateCache } = require('../utils/redis');

/**
 * REST controller for Emotional Momentum Index (EMI)
 */

/**
 * POST /emi/event
 * Log a new match event and recalculate EMI
 */
const postMatchEvent = async (req, res) => {
    try {
        const { matchId, teamId, eventType, playerId } = req.body;

        if (!matchId || !teamId || !eventType) {
            return res.status(400).json({ error: 'matchId, teamId, and eventType are required' });
        }

        const timestamp = new Date().toISOString();
        const result = await emiService.processNewEvent({ matchId, teamId, eventType, playerId, timestamp });

        // Invalidate the cache for this match
        await invalidateCache(`emi:match:${matchId}`);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('[Error] postMatchEvent:', error.message);
        if (error.message.includes('Invalid event type')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error while processing match event' });
    }
};

/**
 * GET /emi/match/:id
 * Retrieve current EMI score for a specific match
 */
const getMatchEMI = async (req, res) => {
    try {
        const matchId = req.params.id;
        const cacheKey = `emi:match:${matchId}`;

        // Try getting from cache first
        const cachedData = await getCache(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData
            });
        }

        // Fetch events and calculate if miss
        const events = await emiService.getMatchEvents(matchId);
        if (events.length === 0) {
            return res.status(404).json({ error: 'No events found for this match' });
        }

        const momentum = emiService.calculateMatchMomentum(events);

        // Store result in cache (TTL 300s = 5m)
        await setCache(cacheKey, momentum, 300);

        res.status(200).json({
            success: true,
            source: 'db',
            data: momentum
        });
    } catch (error) {
        console.error(`[Error] getMatchEMI for ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Internal server error while fetching match EMI' });
    }
};

/**
 * GET /emi/team/:id
 * Retrieves average or accumulated momentum over multiple matches for a team
 */
const getTeamEMI = async (req, res) => {
    try {
        const teamId = req.params.id;
        // In a real scenario, this would aggregate recent matches.
        // For demonstration, we simply return a mock data.
        const responseData = {
            teamId,
            averageMomentum: 74,
            trend: 'POSITIVE',
            lastUpdated: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error(`[Error] getTeamEMI for ${req.params.id}:`, error.message);
        res.status(500).json({ error: 'Internal server error while fetching team EMI' });
    }
};

module.exports = {
    postMatchEvent,
    getMatchEMI,
    getTeamEMI
};
