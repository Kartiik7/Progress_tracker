const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middleware/authMiddleware');

// Get GitHub stats for a specific user
router.get('/:username', authMiddleware, githubController.getGithubStats);

module.exports = router;
