const express = require('express');
const router = express.Router();
const leetcodeController = require('../controllers/leetcodeController.js');
const authMiddleware = require('../middleware/authMiddleware');

// Defines the route for getting LeetCode stats.
// It uses authMiddleware to ensure the user is logged in.
// It calls the getStats function from the controller to handle the request.
router.get('/:username', authMiddleware, leetcodeController.getStats);

module.exports = router;

