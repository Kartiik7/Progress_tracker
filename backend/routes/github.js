const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middleware/authMiddleware');

// Get GitHub stats for a specific user
router.get('/:username', authMiddleware, githubController.getGithubStats);

// Get GitHub stats for the logged-in user (uses saved username in settings)
router.get('/', authMiddleware, (req, res, next) => {
    try {
        const githubUsername = req.user?.settings?.githubUsername;

        if (!githubUsername) {
            return res.status(400).json({
                message: 'No GitHub username is set in your profile settings. Please add it first.'
            });
        }

        // Modify req.params to be what the controller expects
        req.params.username = githubUsername;

        // Forward the request to the controller
        return githubController.getGithubStats(req, res, next);
    } catch (err) {
        console.error('Error in /api/github route:', err);
        res.status(500).json({ message: 'Failed to fetch GitHub stats.' });
    }
});

module.exports = router;