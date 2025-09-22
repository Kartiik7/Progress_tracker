const express = require('express');
const router = express.Router();
const leetcodeController = require('../controllers/leetcodeController');
const authMiddleware = require('../middleware/authMiddleware');

// This route now fetches stats for the currently logged-in user
// GET /api/leetcode
router.get('/', authMiddleware, leetcodeController.getStats);

module.exports = router;

