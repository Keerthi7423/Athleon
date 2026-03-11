const express = require('express');
const router = express.Router();
const fatigueController = require('../controllers/fatigue.controller');

/**
 * REST API endpoints for Fatigue Prediction
 */

// GET /fatigue/player/:id
router.get('/player/:id', fatigueController.getPlayerFatigue);

// POST /fatigue/calculate
router.post('/calculate', fatigueController.calculateFatigue);

// GET /fatigue/team/:id
router.get('/team/:id', fatigueController.getTeamFatigue);

module.exports = router;
