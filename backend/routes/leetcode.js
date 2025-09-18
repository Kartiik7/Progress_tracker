const express = require('express');
const router = express.Router();
const leetcodeController = require('../controllers/leetcodeController');
const authMiddleware = require('../middleware/authMiddleware');

// The user must be logged in to use this feature
router.get('/:username', authMiddleware, leetcodeController.getLeetCodeStats);

module.exports = router;
