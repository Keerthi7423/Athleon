const axios = require('axios');
const config = require('../config/env');

// Axios instance to mock internal microservice communication
// In a real microservices architecture, this would point to different service URLs
const BASE_URL = `http://localhost:${config.port}`;

/**
 * 3. Axios service calls
 * 4. Response aggregation logic
 */

const getPlayerAnalytics = async (playerId) => {
    // Fire all requests in parallel to reduce response time
    const fatiguePromise = axios.get(`${BASE_URL}/fatigue/player/${playerId}`).catch(err => ({ data: { error: err.message } }));
    const statsPromise = axios.get(`${BASE_URL}/api/v1/analytics/players/${playerId}/stats`).catch(err => ({ data: { error: err.message } }));

    const [fatigueRes, statsRes] = await Promise.all([fatiguePromise, statsPromise]);

    return {
        playerId,
        fatigue: fatigueRes.data,
        stats: statsRes.data,
        lastUpdated: new Date().toISOString()
    };
};

const getMatchAnalytics = async (matchId) => {
    const emiPromise = axios.get(`${BASE_URL}/emi/match/${matchId}`).catch(err => ({ data: { error: err.message } }));
    const resultsPromise = axios.get(`${BASE_URL}/api/v1/analytics/matches/${matchId}/results`).catch(err => ({ data: { error: err.message } }));

    const [emiRes, resultsRes] = await Promise.all([emiPromise, resultsPromise]);

    return {
        matchId,
        emi: emiRes.data,
        results: resultsRes.data,
        lastUpdated: new Date().toISOString()
    };
};

const getTeamAnalytics = async (teamId) => {
    const emiPromise = axios.get(`${BASE_URL}/emi/team/${teamId}`).catch(err => ({ data: { error: err.message } }));
    const fatiguePromise = axios.get(`${BASE_URL}/fatigue/team/${teamId}`).catch(err => ({ data: { error: err.message } }));

    const [emiRes, fatigueRes] = await Promise.all([emiPromise, fatiguePromise]);

    return {
        teamId,
        emi: emiRes.data,
        fatigue: fatigueRes.data,
        lastUpdated: new Date().toISOString()
    };
};

module.exports = {
    getPlayerAnalytics,
    getMatchAnalytics,
    getTeamAnalytics
};
