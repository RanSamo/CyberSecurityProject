const jwt = require('jsonwebtoken');
const { validatePassword } = require('../utils/password-validator');
const userModel = require('../models/user-model');
const sendEmail = require('../utils/mailer');

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
      
      const result = await userModel.createUserVulnerable(firstName, lastName, uEmail, password);
      
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
    const result = await userModel.verifyUserVulnerable(uEmail, password);
    
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
        { expiresIn: '1h' }
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

    // Check if the email exists in the system
    const result = await userModel.requestPasswordReset(uEmail);

    // If the email is not found in the database
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: 'User not found in the system'
      });
    }

    // Create the reset token
    const resetToken = result.token;

    // Send the email with the token link
    await sendEmail(
      uEmail,
      'Password Reset Request',
      `Fill in this token in the "Email Token" field:\n\n${resetToken}`
    );

    // Response for successful token generation
    res.status(200).json({ 
      success: true, 
      message: 'A password reset token is being sent to your email' 
    });

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

async changePassword(req, res) {
  try {
    // Get userId from JWT token (added by auth middleware)
    const userId = req.userId;
    
    // Get information from the request body
    const { currentPassword, newPassword } = req.body;
    
    // Call the model function to change the password
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