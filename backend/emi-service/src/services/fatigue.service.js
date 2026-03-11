const db = require('../config/db');
const { emitFatigueAlert } = require('./eventEmitters');

/**
 * 3. Database query examples
 * Fetch player workload data from PostgreSQL
 */
const getPlayerWorkloadData = async (playerId) => {
    const query = `
        SELECT 
            player_id, 
            distance_covered_km, 
            high_intensity_sprints, 
            heart_rate_avg, 
            minutes_played
        FROM player_match_stats
        WHERE player_id = $1
        ORDER BY match_date DESC
        LIMIT 5;
    `;
    const { rows } = await db.query(query, [playerId]);
    return rows;
};

/**
 * Fetch team workload data
 */
const getTeamWorkloadData = async (teamId) => {
    const query = `
        SELECT 
            pms.player_id, 
            pms.distance_covered_km, 
            pms.high_intensity_sprints, 
            pms.heart_rate_avg, 
            pms.minutes_played
        FROM player_match_stats pms
        JOIN players p ON pms.player_id = p.id
        WHERE p.team_id = $1
        -- Taking recent matches data approximation
        ORDER BY pms.match_date DESC
        LIMIT 50;
    `;
    const { rows } = await db.query(query, [teamId]);
    return rows;
};

/**
 * 2. Fatigue calculation logic
 */
const calculateFatigueScore = (workloadData) => {
    if (!workloadData || workloadData.length === 0) return 0;

    // Simple algorithm: average of normalized metrics over last 5 matches
    let totalScore = 0;
    workloadData.forEach(match => {
        // Assume maximums: distance=15km, sprints=40, hr=180, minutes=90
        const distanceScore = (match.distance_covered_km / 15) * 30; // 30% weight
        const sprintScore = (match.high_intensity_sprints / 40) * 30; // 30% weight
        const hrScore = (match.heart_rate_avg / 180) * 20; // 20% weight
        const minutesScore = (match.minutes_played / 90) * 20; // 20% weight

        totalScore += (distanceScore + sprintScore + hrScore + minutesScore);
    });

    const averageFatigue = totalScore / workloadData.length;
    return Math.min(Math.round(averageFatigue), 100); // cap at 100
};

/**
 * Determine injury risk based on fatigue score
 */
const determineInjuryRisk = (fatigueScore) => {
    if (fatigueScore >= 85) return 'CRITICAL';
    if (fatigueScore >= 70) return 'HIGH';
    if (fatigueScore >= 50) return 'MODERATE';
    return 'LOW';
};

/**
 * Process player fatigue
 */
const processPlayerFatigue = async (playerId) => {
    const workloadData = await getPlayerWorkloadData(playerId);

    if (workloadData.length === 0) {
        throw new Error('No workload data found for player');
    }

    const fatigueScore = calculateFatigueScore(workloadData);
    const riskLevel = determineInjuryRisk(fatigueScore);

    const fatigueResult = {
        playerId,
        fatigueScore,
        riskLevel,
        calculatedAt: new Date().toISOString()
    };

    // 5. Socket.io alert event
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
        emitFatigueAlert(playerId, { level: riskLevel, metric: fatigueScore });
    }

    return fatigueResult;
};

module.exports = {
    getPlayerWorkloadData,
    getTeamWorkloadData,
    calculateFatigueScore,
    determineInjuryRisk,
    processPlayerFatigue
};
