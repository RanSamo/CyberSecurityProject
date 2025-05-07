const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');

// Register a new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Request password reset
router.post('/request-reset', userController.requestPasswordReset);

// Reset password with token
router.post('/reset-password', userController.resetPassword);

// Change password (in a production app, this would require authentication middleware)
router.post('/change-password', userController.changePassword);

module.exports = router;