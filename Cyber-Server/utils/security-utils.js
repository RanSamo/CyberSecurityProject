const crypto = require('crypto');

// Security utility functions
const securityUtils = {
  // Generate random salt
  generateSalt() {
    return crypto.randomBytes(32).toString('hex');
  },

  // Hash password with HMAC + Salt
  hashPassword(password, salt) {
    const hmac = crypto.createHmac('sha256', salt);
    hmac.update(password);
    return hmac.digest('hex');
  },
  
  // Generate SHA-1 token for password reset
  generateResetToken() {
    return crypto.createHash('sha1')
      .update(crypto.randomBytes(20).toString('hex'))
      .digest('hex');
  }
};

module.exports = securityUtils;