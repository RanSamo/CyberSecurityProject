// Import all models and utilities
const userModel = require('./user-model');
const clientModel = require('./client-model');
const securityUtils = require('../utils/security-utils');
const passwordConfig = require('../config/password-config');
const { validatePassword, getPasswordConfig } = require('../utils/password-validator');

// Export all modules
module.exports = {
  // Models
  userModel,
  clientModel,
  
  // Security utilities
  security: securityUtils,
  
  // Password configuration
  passwordConfig,
  passwordValidator: {
    validatePassword,
    getPasswordConfig
  }
};