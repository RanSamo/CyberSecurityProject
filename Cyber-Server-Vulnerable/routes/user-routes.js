const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controller');
const { authenticateUser } = require('../middleware/auth'); 


// Register a new user
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Request password reset
router.post('/request-reset', userController.requestPasswordReset);

// Reset password with token
router.post('/reset-password', userController.resetPassword);

router.post('/change-password', authenticateUser, userController.changePassword);

module.exports = router;