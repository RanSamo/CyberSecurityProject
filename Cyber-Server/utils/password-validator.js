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

          // Check each historical password
          for (const item of history) {
            const historicalMatch = await securityUtils.verifyPassword(password, item.password_hash, item.salt);

            if (historicalMatch) {
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

function getPasswordConfig() {
  return { ...passwordConfig };
}

module.exports = {
  validatePassword,
  getPasswordConfig
};