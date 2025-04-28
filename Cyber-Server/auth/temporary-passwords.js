const { pool } = require('../db');
const securityUtils = require('../security-utils');
const passwordConfig = require('../password-config');
const { validatePassword } = require('../password-validator');

// User-related database functions
const userModel = {
  // Create a new user (vulnerable version for SQL injection demonstration)
  async createUserVulnerable(username, email, password) {
    const connection = await pool.getConnection();
    try {
      const validationResult = await validatePassword(password);
      if (!validationResult.valid) {
        return { success: false, message: 'Password does not meet requirements', errors: validationResult.errors };
      }

      const salt = securityUtils.generateSalt();
      const passwordHash = securityUtils.hashPassword(password, salt);

      const query = `INSERT INTO users (username, email, password_hash, salt) 
                     VALUES ('${username}', '${email}', '${passwordHash}', '${salt}')`;

      const [result] = await connection.query(query);

      await connection.query(
        `INSERT INTO password_history (user_id, password_hash, salt) 
         VALUES (${result.insertId}, '${passwordHash}', '${salt}')`
      );

      return { success: true, userId: result.insertId };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Create a new user (secure version)
  async createUserSecure(username, email, password) {
    const connection = await pool.getConnection();
    try {
      const validationResult = await validatePassword(password);
      if (!validationResult.valid) {
        return { success: false, message: 'Password does not meet requirements', errors: validationResult.errors };
      }

      const salt = securityUtils.generateSalt();
      const passwordHash = securityUtils.hashPassword(password, salt);

      const [result] = await connection.query(
        'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, salt]
      );

      await connection.query(
        'INSERT INTO password_history (user_id, password_hash, salt) VALUES (?, ?, ?)',
        [result.insertId, passwordHash, salt]
      );

      return { success: true, userId: result.insertId };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Verify user login (vulnerable version)
  async verifyUserVulnerable(username, password) {
    const connection = await pool.getConnection();
    try {
      const query = `SELECT * FROM users WHERE username = '${username}'`;
      const [users] = await connection.query(query);

      if (users.length === 0) {
        return { success: false, message: 'Invalid credentials' };
      }

      const user = users[0];
      const hashedPassword = securityUtils.hashPassword(password, user.salt);

      if (hashedPassword !== user.password_hash) {
        await connection.query(
          `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE user_id = ${user.user_id}`
        );

        const maxAttempts = passwordConfig.loginAttempts.max;
        if (user.failed_login_attempts + 1 >= maxAttempts) {
          await connection.query(
            `UPDATE users SET account_locked = TRUE WHERE user_id = ${user.user_id}`
          );
        }

        return { success: false, message: 'Invalid credentials' };
      }

      await connection.query(
        `UPDATE users SET failed_login_attempts = 0 WHERE user_id = ${user.user_id}`
      );

      return { success: true, userId: user.user_id, username: user.username, email: user.email };
    } catch (error) {
      console.error('Error verifying user:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Verify user login (secure version)
  async verifyUserSecure(username, password) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);

      if (users.length === 0) {
        return { success: false, message: 'Invalid credentials' };
      }

      const user = users[0];
      const hashedPassword = securityUtils.hashPassword(password, user.salt);

      if (hashedPassword !== user.password_hash) {
        await connection.query(
          'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE user_id = ?',
          [user.user_id]
        );

        const maxAttempts = passwordConfig.loginAttempts.max;
        if (user.failed_login_attempts + 1 >= maxAttempts) {
          await connection.query(
            'UPDATE users SET account_locked = TRUE WHERE user_id = ?',
            [user.user_id]
          );
        }

        return { success: false, message: 'Invalid credentials' };
      }

      await connection.query(
        'UPDATE users SET failed_login_attempts = 0 WHERE user_id = ?',
        [user.user_id]
      );

      return { success: true, userId: user.user_id, username: user.username, email: user.email };
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
      const [users] = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);

      if (users.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const user = users[0];
      const hashedCurrentPassword = securityUtils.hashPassword(currentPassword, user.salt);

      if (hashedCurrentPassword !== user.password_hash) {
        return { success: false, message: 'Current password is incorrect' };
      }

      const validationResult = await validatePassword(newPassword, userId);
      if (!validationResult.valid) {
        return { success: false, message: 'Password does not meet requirements', errors: validationResult.errors };
      }

      const newSalt = securityUtils.generateSalt();
      const newPasswordHash = securityUtils.hashPassword(newPassword, newSalt);

      const historyCount = passwordConfig.history.count;
      const [history] = await connection.query(
        'SELECT * FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, historyCount]
      );

      for (const item of history) {
        const historicalHash = securityUtils.hashPassword(newPassword, item.salt);
        if (historicalHash === item.password_hash) {
          return { success: false, message: `Cannot reuse one of your last ${historyCount} passwords` };
        }
      }

      await connection.query(
        'UPDATE users SET password_hash = ?, salt = ? WHERE user_id = ?',
        [newPasswordHash, newSalt, userId]
      );

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
      const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        return { success: true };
      }

      const user = users[0];
      const resetToken = securityUtils.generateResetToken();

      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1);

      await connection.query(
        'UPDATE users SET password_reset_token = ?, password_reset_token_expiry = ? WHERE user_id = ?',
        [resetToken, expiry, user.user_id]
      );

      return { success: true, token: resetToken, userId: user.user_id };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Validate reset token and update password
  async resetPassword(token, newPassword) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_token_expiry > NOW()',
        [token]
      );

      if (users.length === 0) {
        return { success: false, message: 'Invalid or expired token' };
      }

      const user = users[0];

      const validationResult = await validatePassword(newPassword);
      if (!validationResult.valid) {
        return { success: false, message: 'Password does not meet requirements', errors: validationResult.errors };
      }

      const newSalt = securityUtils.generateSalt();
      const newPasswordHash = securityUtils.hashPassword(newPassword, newSalt);

      await connection.query(
        'UPDATE users SET password_hash = ?, salt = ?, password_reset_token = NULL, password_reset_token_expiry = NULL WHERE user_id = ?',
        [newPasswordHash, newSalt, user.user_id]
      );

      await connection.query(
        'INSERT INTO password_history (user_id, password_hash, salt) VALUES (?, ?, ?)',
        [user.user_id, newPasswordHash, newSalt]
      );

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }
};

module.exports = userModel;
