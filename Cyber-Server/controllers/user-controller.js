const jwt = require('jsonwebtoken');
const { userModel } = require('../models');
const { validatePassword } = require('../utils/password-validator');

// User controller functions
const userController = {
  // Register a new user
  async registerUser(req, res) {
    try {
      const { firstName, lastName, uEmail, password } = req.body;
      
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
      const result = await userModel.createUserSecure(firstName, lastName, uEmail, password);
      
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
  },

  // Login user
async loginUser(req, res) {
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
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: result.userId,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(200).json({ 
        success: true, 
        userId: result.userId,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        token: token
      });
    } else {
      res.status(401).json({ success: false, message: result.message || 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
},

  // Request password reset
  async requestPasswordReset(req, res) {
  try {
    const { uEmail } = req.body;
    const result = await userModel.requestPasswordReset(uEmail);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found in the system'
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'A password reset link has been sent to your email'
    });

    // For now: print the token to console for testing
    if (result.token) {
      console.log('Reset token for email', uEmail, ':', result.token);
      // Later: sendResetEmail(uEmail, result.token);
    }

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
},

  // Reset password with token
  async resetPassword(req, res) {
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
  },



  // Change password - will change this to use only token without email
async changePassword(req, res) {
  try {
    // Get userId from JWT token (added by auth middleware)
    const userId = req.userId;
    
    // Get information from the request body
    const { uEmail, currentPassword, newPassword } = req.body;
    
    // Verify the email belongs to the authenticated user
    const userByEmail = await userModel.findUserByEmail(uEmail);
    
    if (!userByEmail.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found with provided email' 
      });
    }
    
    // Make sure the email belongs to the authenticated user
    if (userByEmail.user.user_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to change this user\'s password' 
      });
    }
    
    // Now call the model function to change the password
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
}
}
module.exports = userController;