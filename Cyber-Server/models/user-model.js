const { pool } = require('../config/db');
const securityUtils = require('../utils/security-utils');
const passwordConfig = require('../config/password-config');

const userModel = {
  async verifyUserSecure(email, password) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) return { success: false, message: 'Invalid credentials' };

      const user = users[0];
      if (user.account_locked) {
        return {
          success: false,
          message: 'Account is locked. Please reset your password or contact support.'
        };
      }

      const passwordValid = await securityUtils.verifyPassword(password, user.password_hash, user.salt);
      if (!passwordValid) {
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

  async findUserByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) return { success: false, message: 'User not found' };
      return { success: true, user: users[0] };
    } catch (error) {
      console.error('Error finding user by email:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }
};

module.exports = userModel;
