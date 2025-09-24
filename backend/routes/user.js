const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const userController = require('../controllers/userController');

// Get user profile
router.get("/profile", authMiddleware, userController.getProfile);

// Update user profile (settings)
router.put("/profile", authMiddleware, userController.updateProfile);

// --- NEW: Route to handle the initial request to change an email ---
router.post("/request-email-change", authMiddleware, userController.requestEmailChange);

// Change password
router.post('/change-password', authMiddleware, userController.changePassword);

// Verify password for sensitive actions
router.post('/verify-password', authMiddleware, userController.verifyPassword);

module.exports = router;