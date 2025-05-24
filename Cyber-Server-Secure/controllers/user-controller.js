const jwt = require('jsonwebtoken');
const { validatePassword } = require('../utils/password-validator');
const userModel = require('../models/user-model');
const sendEmail = require('../utils/mailer');
const inputValidator = require('../utils/input-validator');

// User controller functions
const userController = {
  // Register a new user (secure version with validation and encoding)
  async registerUser(req, res) {
    try {
      const { firstName, lastName, uEmail, password } = req.body;
      
      console.log('📥 Incoming registration data (SECURE VERSION):', { firstName, lastName, uEmail, password: '***' });
      
      // Use the complete validateUserRegistration method
      const validationResult = inputValidator.validateUserRegistration(req.body);
      
      // Check for validation errors
      if (!validationResult.isValid) {
        console.log('Input validation failed:', validationResult.errors);
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid input data', 
          errors: validationResult.errors 
        });
      }
      
      console.log('Input validation passed');
      console.log('Sanitized data:', { ...validationResult.sanitizedData, password: '***' });
      
      // Validate the password against configuration requirements
      const passwordValidationResult = await validatePassword(password);
      if (!passwordValidationResult.valid) {
        console.log('Password validation failed:', passwordValidationResult.errors);
        return res.status(400).json({ 
          success: false, 
          message: 'Password does not meet requirements',
          errors: passwordValidationResult.errors
        });
      }
      
      console.log('Password validation passed');
      
      // Use the secure version with sanitized data
      const result = await userModel.createUserSecure(
        validationResult.sanitizedData.firstName, 
        validationResult.sanitizedData.lastName, 
        validationResult.sanitizedData.uEmail, // 
        password
      );
      
      if (result.success) {
        console.log('User registered successfully with sanitized data');
        res.status(201).json({ success: true, userId: result.userId });
      } else {
        console.log('User registration failed:', result.message);
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

  // Login user - with input validation and consistent encoding
  async loginUser(req, res) {
    try {
      const { uEmail, password } = req.body;
      
      console.log('Login attempt (SECURE VERSION):', { uEmail, password: '***' });
      
      // Basic input validation for login
      if (!uEmail || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }
      
      // Validate email format
      const emailResult = inputValidator.validateEmail(uEmail);
      if (!emailResult.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }
      
      // First find user by email
      const userResult = await userModel.findUserByEmail(emailResult.sanitized);
      
      if (!userResult.success) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Now verify with email and password - using your existing secure method
      const result = await userModel.verifyUserSecure(emailResult.sanitized, password);
      
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
        
        console.log('User logged in successfully');
        
        // Encode user data for consistent security (required by instructions)
        res.status(200).json({ 
          success: true, 
          userId: result.userId,
          email: inputValidator.htmlEncode(result.email),
          firstName: inputValidator.htmlEncode(result.firstName),
          lastName: inputValidator.htmlEncode(result.lastName),
          token: token
        });
      } else {
        console.log('❌ Login failed:', result.message);
        res.status(401).json({ success: false, message: result.message || 'Invalid credentials' });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      res.status(500).json({ success: false, message: 'Server error during login' });
    }
  },

  // Request password reset - with input validation
  async requestPasswordReset(req, res) {
    try {
      const { uEmail } = req.body;

      console.log('📥 Password reset request (SECURE VERSION):', { uEmail });

      // Validate email
      const emailResult = inputValidator.validateEmail(uEmail);
      if (!emailResult.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email format' 
        });
      }

      // Check if the email exists in the system
      const result = await userModel.requestPasswordReset(emailResult.sanitized);

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
        emailResult.sanitized,
        'Password Reset Request',
        `Fill in this token in the "Email Token" field:\n\n${resetToken}`
      );

      // Response for successful token generation
      res.status(200).json({ 
        success: true, 
        message: 'A password reset token is being sent to your email' 
      });

    } catch (error) {
      console.error('❌ Password reset request error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Reset password with token - with input validation
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      console.log('📥 Password reset with token (SECURE VERSION)');

      // Basic validation
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid token is required' 
        });
      }

      if (!newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'New password is required' 
        });
      }

      const result = await userModel.resetPassword(token.trim(), newPassword);

      if (result.success) {
        console.log('✅ Password reset successfully');
        res.status(200).json({ success: true, message: 'Password has been reset successfully' });
      } else {
        console.log('❌ Password reset failed:', result.message);
        res.status(400).json({ success: false, message: result.message || 'Password reset failed' });
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Change password - with input validation
  async changePassword(req, res) {
    try {
      // Get userId from JWT token (added by auth middleware)
      const userId = req.userId;
      
      // Get information from the request body
      const { currentPassword, newPassword } = req.body;
      
      console.log('📥 Password change request (SECURE VERSION) for userId:', userId);
      
      // Basic validation
      if (!currentPassword || typeof currentPassword !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is required' 
        });
      }

      if (!newPassword || typeof newPassword !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'New password is required' 
        });
      }
      
      // Call the model function to change the password
      const result = await userModel.changePassword(userId, currentPassword, newPassword);
      
      if (result.success) {
        console.log('✅ Password changed successfully');
        res.status(200).json({ success: true, message: 'Password changed successfully' });
      } else {
        console.log('❌ Password change failed:', result.message);
        res.status(400).json({ 
          success: false, 
          message: result.message || 'Password change failed',
          errors: result.errors
        });
      }
    } catch (error) {
      console.error('❌ Password change error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = userController;