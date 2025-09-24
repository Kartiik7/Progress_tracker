const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require('../controllers/userController');

// Get user profile (replaces GET /settings)
router.get("/profile", authMiddleware, userController.getProfile);

// Update user profile (replaces PATCH /settings)
router.put("/profile", authMiddleware, userController.updateProfile);

// Change password
router.post('/change-password', authMiddleware, userController.changePassword);

// Verify password for sensitive actions
router.post('/verify-password', authMiddleware, userController.verifyPassword);

module.exports = router;