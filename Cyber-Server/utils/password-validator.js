const { pool } = require('../config/db');
const passwordConfig = require('../config/password-config');
const securityUtils = require('./security-utils');

// Validate password against policy requirements from config file
async function validatePassword(password, userId = null) {
  try {
    const errors = [];
    
    // Check minimum length
    if (password.length < passwordConfig.minLength) {
      errors.push(`Password must be at least ${passwordConfig.minLength} characters long`);
    }
    
    // Check for uppercase letters
    if (passwordConfig.complexity.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Check for lowercase letters
    if (passwordConfig.complexity.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    // Check for numbers
    if (passwordConfig.complexity.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    // Check for special characters
    if (passwordConfig.complexity.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check dictionary words if enabled
    if (passwordConfig.dictionary.enabled) {
      // Check if password contains any of the dictionary words
      const containsDictionaryWord = passwordConfig.dictionary.words.some(word => 
        password.toLowerCase().includes(word.toLowerCase())
      );
      
      if (containsDictionaryWord) {
        errors.push('Password contains common words or patterns that are not allowed');
      }
    }
    
    // Check password history if userId is provided
    if (userId) {
      const connection = await pool.getConnection();
      try {
        const historyCount = passwordConfig.history.count;
        
        // Get password history
        const [user] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        
        if (user && user.length > 0) {
          const [history] = await connection.query(
            'SELECT * FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, historyCount]
          );
          
          // We need the user's salt to hash the new password for comparison
          for (const item of history) {
            const historicalHash = securityUtils.hashPassword(password, item.salt);
            
            if (historicalHash === item.password_hash) {
              errors.push(`Cannot reuse one of your last ${historyCount} passwords`);
              break;
            }
          }
        }
      } finally {
        connection.release();
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('Error validating password:', error);
    return {
      valid: false,
      errors: ['An error occurred while validating the password']
    };
  }
}

// Function to update the configuration file (for administrators)
function updatePasswordConfig(newConfig) {
  try {
    // In a real implementation, this would write to the config file
    // For simplicity, we're just updating the in-memory config
    if (newConfig.minLength !== undefined) {
      passwordConfig.minLength = newConfig.minLength;
    }
    
    if (newConfig.complexity) {
      Object.assign(passwordConfig.complexity, newConfig.complexity);
    }
    
    if (newConfig.history && newConfig.history.count !== undefined) {
      passwordConfig.history.count = newConfig.history.count;
    }
    
    if (newConfig.loginAttempts && newConfig.loginAttempts.max !== undefined) {
      passwordConfig.loginAttempts.max = newConfig.loginAttempts.max;
    }
    
    if (newConfig.dictionary) {
      Object.assign(passwordConfig.dictionary, newConfig.dictionary);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating password config:', error);
    return { success: false, error: error.message };
  }
}

// Get the current password configuration
function getPasswordConfig() {
  return { ...passwordConfig };  // Return a copy to prevent direct modification
}

module.exports = { 
  validatePassword,
  updatePasswordConfig,
  getPasswordConfig
};