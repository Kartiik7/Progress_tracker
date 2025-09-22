const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Get user profile (including settings)
router.get('/profile', authMiddleware, userController.getProfile);

// Update user profile (settings)
router.put('/profile', authMiddleware, userController.updateProfile);

// Change user password
router.post('/change-password', authMiddleware, userController.changePassword);

// Verify user's current password
router.post('/verify-password', authMiddleware, userController.verifyPassword);

module.exports = router;

