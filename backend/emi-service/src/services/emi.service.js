const db = require('../config/db');
const { emitMomentumShift } = require('./eventEmitters');

/**
 * 2. Event weight configuration
 */
const EVENT_WEIGHTS = {
    'GOAL': 100,
    'SHOT_ON_TARGET': 20,
    'CORNER': 10,
    'TACKLE_WON': 15,
    'INTERCEPTION': 10,
    'FOUL_COMMITTED': -15,
    'YELLOW_CARD': -30,
    'RED_CARD': -80,
    'OFFSIDE': -10
};

/**
 * 4. PostgreSQL event storage
 * Store a new match event
 */
const storeMatchEvent = async (matchId, teamId, eventType, timestamp, playerId = null) => {
    const query = `
        INSERT INTO match_events (match_id, team_id, player_id, event_type, timestamp)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [matchId, teamId, playerId, eventType, timestamp || new Date().toISOString()];
    const { rows } = await db.query(query, values);
    return rows[0];
};

/**
 * Fetch all recent events for a match
 */
const getMatchEvents = async (matchId) => {
    const query = `
        SELECT * FROM match_events
        WHERE match_id = $1
        ORDER BY timestamp DESC
        LIMIT 100;
    `;
    const { rows } = await db.query(query, [matchId]);
    return rows;
};

/**
 * 3. EMI calculation logic
 * Calculate current momentum based on recent events
 */
const calculateMatchMomentum = (events) => {
    const momentumScores = {};
    const DECAY_FACTOR = 0.9; // Recent events count more

    // Sort chronological for decay calculation
    const chronologicalEvents = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    chronologicalEvents.forEach((event, index) => {
        const teamId = event.team_id;
        if (!momentumScores[teamId]) {
            momentumScores[teamId] = 0;
        }

        const weight = EVENT_WEIGHTS[event.event_type] || 0;
        // Apply decay relative to how recent the event was (simplified)
        const decayMultiplier = Math.pow(DECAY_FACTOR, chronologicalEvents.length - 1 - index);

        momentumScores[teamId] += weight * decayMultiplier;
    });

    // Normalize to probabilities if there are exactly 2 teams
    const teams = Object.keys(momentumScores);
    if (teams.length === 2) {
        const t1 = teams[0];
        const t2 = teams[1];

        // Ensure scores are positive for ratio calculation
        const offset = Math.min(0, Math.min(momentumScores[t1], momentumScores[t2])) - 10;
        const s1 = momentumScores[t1] - offset;
        const s2 = momentumScores[t2] - offset;
        const total = s1 + s2;

        return {
            [t1]: { score: momentumScores[t1], probability: total > 0 ? s1 / total : 0.5 },
            [t2]: { score: momentumScores[t2], probability: total > 0 ? s2 / total : 0.5 }
        };
    }

    return momentumScores;
};

/**
 * Process a new event and broadcast updates
 */
const processNewEvent = async (eventData) => {
    const { matchId, teamId, eventType, playerId, timestamp } = eventData;

    if (!EVENT_WEIGHTS[eventType]) {
        throw new Error(`Invalid event type: ${eventType}`);
    }

    // Store the event
    const storedEvent = await storeMatchEvent(matchId, teamId, eventType, timestamp, playerId);

    // Recalculate match momentum
    const recentEvents = await getMatchEvents(matchId);
    const momentum = calculateMatchMomentum(recentEvents);

    // 6. Socket.io event broadcast
    const momentumData = momentum[teamId];
    if (momentumData) {
        // Emit momentum shift for the match
        emitMomentumShift(matchId, {
            teamId,
            eventType,
            probability: momentumData.probability,
            momentumScore: momentumData.score
        });
    }

    return {
        event: storedEvent,
        momentum
    };
};

module.exports = {
    EVENT_WEIGHTS,
    storeMatchEvent,
    getMatchEvents,
    calculateMatchMomentum,
    processNewEvent
};
