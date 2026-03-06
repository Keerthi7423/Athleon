const { getIO } = require('../utils/socketUtils');

/**
 * Event emitter utility mapping
 * 2. Event emitter examples
 * Standardizes the events and payload structures for real-time broadcasts
 */

/**
 * 4. Example event broadcast: Emit a score update
 * @param {string} matchId
 * @param {object} scoreData - i.e. { teamA: 80, teamB: 85 }
 */
const emitScoreUpdate = (matchId, scoreData) => {
    try {
        const io = getIO();
        const eventName = 'score_update';

        // Broadcast to the whole match room
        io.to(`match_${matchId}`).emit(eventName, {
            matchId,
            timestamp: new Date().toISOString(),
            score: scoreData,
        });

        console.log(`[Event Emitted] ${eventName} for match ${matchId}:`, scoreData);
    } catch (error) {
        // 5. Global Error Handling
        console.error(`[Event Error] Failed to emit score update for match ${matchId}:`, error);
    }
};

/**
 * 4. Example event broadcast: Emit a fatigue alert
 * Specific to a player, can be broadcast globally or to a specific team's room
 * @param {string} playerId
 * @param {object} fatigueData - i.e. { level: 'HIGH', metric: 85 }
 */
const emitFatigueAlert = (playerId, fatigueData) => {
    try {
        const io = getIO();
        const eventName = 'fatigue_alert';

        // Broadcast globally to all connected clients listening
        io.emit(eventName, {
            playerId,
            timestamp: new Date().toISOString(),
            fatigue: fatigueData,
        });

        console.warn(`[Event Emitted] ${eventName} for player ${playerId}:`, fatigueData);
    } catch (error) {
        console.error(`[Event Error] Failed to emit fatigue alert for player ${playerId}:`, error);
    }
};

/**
 * 4. Example event broadcast: Emit a momentum shift
 * Highlights structural changes in match flow
 * @param {string} matchId
 * @param {object} momentumData - i.e. { team: 'Home', probability: 0.75 }
 */
const emitMomentumShift = (matchId, momentumData) => {
    try {
        const io = getIO();
        const eventName = 'momentum_shift';

        io.to(`match_${matchId}`).emit(eventName, {
            matchId,
            timestamp: new Date().toISOString(),
            momentum: momentumData,
        });

        console.log(`[Event Emitted] ${eventName} for match ${matchId}:`, momentumData);
    } catch (error) {
        console.error(`[Event Error] Failed to emit momentum shift for match ${matchId}:`, error);
    }
};

module.exports = {
    emitScoreUpdate,
    emitFatigueAlert,
    emitMomentumShift,
};
