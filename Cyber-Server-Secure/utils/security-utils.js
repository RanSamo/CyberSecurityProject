const crypto = require('crypto');

const securityUtils = {
  // Generate random salt
  generateSalt() {
    return crypto.randomBytes(32).toString('hex');
  },

  // Hash password with PBKDF2 (Password-Based Key Derivation Function 2)
  async hashPassword(password, salt) {
    // Using 100,000 iterations , key length of 64 bytes
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex'));
      });
    });
  },
  
  // Verify a password against a stored hash
  async verifyPassword(password, storedHash, salt) {
    const hashedPassword = await this.hashPassword(password, salt);
    return hashedPassword === storedHash;
  },
  
  // Generate SHA-1 token for password reset
  generateResetToken() {
    return crypto.createHash('sha1')
      .update(crypto.randomBytes(20).toString('hex'))
      .digest('hex');
  }
};

module.exports = securityUtils;