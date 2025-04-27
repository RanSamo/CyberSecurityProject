// Import all models and utilities
const userModel = require('./user-model');
const customerModel = require('./customer-model');
const securityUtils = require('../utils/security-utils');
const passwordConfig = require('../config/password-config');
const { validatePassword, getPasswordConfig } = require('../utils/password-validator');

// Export all modules
module.exports = {
  // Models
  userModel,
  customerModel,
  
  // Security utilities
  security: securityUtils,
  
  // Password configuration
  passwordConfig,
  passwordValidator: {
    validatePassword,
    getPasswordConfig
  }
};