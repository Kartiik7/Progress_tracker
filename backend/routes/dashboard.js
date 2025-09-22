const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/dashboard - Fetches all summary data for the dashboard
router.get('/', authMiddleware, dashboardController.getDashboardData);

module.exports = router;

