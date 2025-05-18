const { pool } = require('../config/db');
const securityUtils = require('../utils/security-utils');
const passwordConfig = require('../config/password-config');
const { validatePassword } = require('../utils/password-validator');
const crypto = require('crypto');


// User-related database functions
const userModel = {
  // Create a new user (vulnerable version for SQL injection demonstration)
  async createUserVulnerable(fname, lname, uEmail, password) {
    const connection = await pool.getConnection();
    try {
      
      // Vulnerable to SQL injection
      const query = `INSERT INTO users (first_name, last_name, email, password_hash, salt) 
                    VALUES ('${fname}', '${lname}', '${uEmail}', '${password}', 'salt')`;
      
      const [result] = await connection.query(query);
    
      return { success: true, userId: result.insertId };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Verify user login (vulnerable version)
  async verifyUserVulnerable(email, password) {
  const connection = await pool.getConnection();
  try {
    // Vulnerable to SQL injection - direct string concatenation
    const query = `SELECT * FROM users WHERE email = '${email}' AND password_hash = '${password}'`;
    
    
    const [users] = await connection.query(query);
    
    if (users.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    const user = users[0];
    
    // Return user data directly - no need for complex verification
    return { 
      success: true,
      userId: user.user_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
},
  
  
  // Change user password
  async changePassword(userId, currentPassword, newPassword) {
    const connection = await pool.getConnection();
    try {
      // Get user info
      const [users] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);
      
      if (users.length === 0) {
        return { success: false, message: 'User not found' };
      }
      
      const user = users[0];
      
      // Verify current password using verifyPassword
      const passwordValid = await securityUtils.verifyPassword(currentPassword, user.password_hash, user.salt);
      if (!passwordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      // Validate new password against configuration
      const validationResult = await validatePassword(newPassword, userId);
      if (!validationResult.valid) {
        return { 
          success: false, 
          message: 'Password does not meet requirements', 
          errors: validationResult.errors 
        };
      }
      
      // Generate new salt and hash
      const newSalt = securityUtils.generateSalt();
      const newPasswordHash = await securityUtils.hashPassword(newPassword, newSalt);
      
      // Check password history
      const historyCount = passwordConfig.history.count;
      const [history] = await connection.query(
        'SELECT * FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, historyCount]
      );
      
      // Check against password history
      for (const item of history) {
        const historicalMatch = await securityUtils.verifyPassword(newPassword, item.password_hash, item.salt);
        if (historicalMatch) {
          return { success: false, message: `Cannot reuse one of your last ${historyCount} passwords` };
        }
      }
      
      // Update password
      await connection.query(
        'UPDATE users SET password_hash = ?, salt = ? WHERE user_id = ?',
        [newPasswordHash, newSalt, userId]
      );
      
      // Add to password history
      await connection.query(
        'INSERT INTO password_history (user_id, password_hash, salt) VALUES (?, ?, ?)',
        [userId, newPasswordHash, newSalt]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },
  
  // Generate password reset token
  async requestPasswordReset(email) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const userId = rows[0].user_id;

    // Use the existing securityUtils.generateResetToken() function
    const token = securityUtils.generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Update the existing fields in the users table
    await connection.query(
      'UPDATE users SET password_reset_token = ?, password_reset_token_expiry = ? WHERE user_id = ?',
      [token, expiresAt, userId]
    );

    return { success: true, token };
  } catch (err) {
    console.error('Error requesting password reset:', err);
    return { success: false, error: err.message };
  } finally {
    connection.release();
  }
}
,
  
  async resetPassword(token, newPassword) {
  const connection = await pool.getConnection();
  try {
    // Find user with valid token
    const [users] = await connection.query(
      'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_token_expiry > NOW()',
      [token]
    );

    if (users.length === 0) {
      return { success: false, message: 'Invalid or expired token' };
    }

    const userId = users[0].user_id;

    // Validate new password
    const validationResult = await validatePassword(newPassword,userId);
    if (!validationResult.valid) {
      return {
        success: false,
        message: 'Password does not meet requirements',
        errors: validationResult.errors
      };
    }

    // Generate new salt and hash
    const newSalt = securityUtils.generateSalt();
    const newPasswordHash = await securityUtils.hashPassword(newPassword, newSalt);

    // Update the user with new password and clear reset token
    await connection.query(
      'UPDATE users SET password_hash = ?, salt = ?, password_reset_token = NULL, password_reset_token_expiry = NULL, account_locked = FALSE, failed_login_attempts = 0 WHERE user_id = ?',
      [newPasswordHash, newSalt, userId]
    );

    // Add password to history
    await connection.query(
      'INSERT INTO password_history (user_id, password_hash, salt) VALUES (?, ?, ?)',
      [userId, newPasswordHash, newSalt]
    );

    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
},

  
  async findUserByEmail(email) {
    const connection = await pool.getConnection();
    try {
      // Secure with parameterized query
      const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      
      if (users.length === 0) {
        return { success: false, message: 'User not found' };
      }
      
      return { 
        success: true,
        user: users[0]
      };
    } catch (error) {
      console.error('Error finding user by email:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }
};

module.exports = userModel;