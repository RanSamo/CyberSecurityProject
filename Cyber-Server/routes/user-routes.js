const express = require('express');
const router = express.Router();
const { userModel } = require('../models');
const { validatePassword } = require('../utils/password-validator');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const {fname, lname, uEmail, password } = req.body;
    
    // Validate the password against configuration requirements
    const validationResult = await validatePassword(password);
    if (!validationResult.valid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password does not meet requirements',
        errors: validationResult.errors
      });
    }
    
    // Use the secure version for production
    const result = await userModel.createUserSecure(fname,lname, uEmail, password);
    
    if (result.success) {
      res.status(201).json({ success: true, userId: result.userId });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message || 'User registration failed', 
        errors: result.errors 
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login route
//TODO.Add here the authentication part with jwt 
router.post('/login', async (req, res) => {
  try {
    const { uEmail, password } = req.body;
    
    // First find user by email
    const userResult = await userModel.findUserByEmail(uEmail);
    
    if (!userResult.success) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Now verify with email and password
    const result = await userModel.verifyUserSecure(uEmail, password);
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        userId: result.userId,
        email: result.email
      });
    } else {
      res.status(401).json({ success: false, message: result.message || 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Request password reset
router.post('/request-reset', async (req, res) => {
  try {
    const { uEmail } = req.body;
    const result = await userModel.requestPasswordReset(uEmail);
    
    // Always return success even if email not found (security best practice)
    res.status(200).json({ 
      success: true, 
      message: 'If your email exists in our system, a reset token has been sent'
    });
    
    //TODO.Need to send an email with the token
    if (result.success && result.token) {
      console.log('Reset token for email', uEmail, ':', result.token);
      // sendResetEmail(uEmail, result.token);
    }
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const result = await userModel.resetPassword(token, newPassword);
    
    if (result.success) {
      res.status(200).json({ success: true, message: 'Password has been reset successfully' });
    } else {
      res.status(400).json({ success: false, message: result.message || 'Password reset failed' });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

//Temp implementation
// Change password (requires authentication in a real app)
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    const result = await userModel.changePassword(userId, currentPassword, newPassword);
    
    if (result.success) {
      res.status(200).json({ success: true, message: 'Password changed successfully' });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message || 'Password change failed',
        errors: result.errors
      });
    }
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;