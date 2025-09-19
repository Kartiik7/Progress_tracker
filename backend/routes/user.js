const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authMiddleware = require('../middleware/authMiddleware');

// All routes in this file are protected
router.use(authMiddleware);

router.get('/profile', userController.getUserProfile);
router.put('/settings', userController.updateUserSettings);
router.post('/change-password', userController.changePassword);

module.exports = router;
