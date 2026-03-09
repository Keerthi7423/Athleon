const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

/**
 * 2. API controller logic - Routing setup
 * Analytics API endpoints for aggregated data
 */

// GET /analytics/player/:id
router.get('/player/:id', analyticsController.getPlayerAnalytics);

// GET /analytics/match/:id
router.get('/match/:id', analyticsController.getMatchAnalytics);

// GET /analytics/team/:id
router.get('/team/:id', analyticsController.getTeamAnalytics);

module.exports = router;
