const express = require('express');
const router = express.Router();
const emiController = require('../controllers/emi.controller');

/**
 * REST API endpoints for Emotional Momentum Index (EMI)
 */

// POST /emi/event
router.post('/event', emiController.postMatchEvent);

// GET /emi/match/:id
router.get('/match/:id', emiController.getMatchEMI);

// GET /emi/team/:id
router.get('/team/:id', emiController.getTeamEMI);

module.exports = router;
