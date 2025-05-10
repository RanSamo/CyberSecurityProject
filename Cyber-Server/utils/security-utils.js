const crypto = require('crypto');

const securityUtils = {
  generateSalt() {
    return crypto.randomBytes(32).toString('hex');
  },

  async hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex'));
      });
    });
  },

  async verifyPassword(password, storedHash, salt) {
    const hashedPassword = await this.hashPassword(password, salt);
    return hashedPassword === storedHash;
  },

  generateResetToken() {
    return crypto
      .createHash('sha1')
      .update(crypto.randomBytes(20).toString('hex'))
      .digest('hex');
  }
};

module.exports = securityUtils;
