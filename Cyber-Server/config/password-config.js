/**
 * Configuration file for password policies
 * These settings can be modified by the system administrator
 */
const passwordConfig = {
    // Minimum password length
    minLength: 10,
    
    // Password complexity requirements
    complexity: {
      requireUppercase: true,   // Require uppercase letters
      requireLowercase: true,   // Require lowercase letters
      requireNumbers: true,     // Require numeric digits
      requireSpecial: true      // Require special characters
    },
    
    // Password history settings
    history: {
      count: 3  // Number of previous passwords to check
    },
    
    // Dictionary word prevention
    dictionary: {
      enabled: true,
      // Common words to prevent in passwords
      words: [
        'password', 'admin', '123456', 'qwerty', 'welcome', 
        'letmein', 'monkey', 'football', 'baseball', 'superman',
        'batman', 'trustno1', 'iloveyou', 'starwars', 'master',
        'access', 'shadow', 'dragon', 'michael', 'mustang',
        'jennifer', 'thomas', 'jordan', 'hunter', 'ranger',
        'buster', 'soccer', 'harley', 'password123', 'hockey'
      ]
    },
    
    // Login attempt restrictions
    loginAttempts: {
      max: 3  // Maximum failed login attempts before account lockout
    }
  };
  
  module.exports = passwordConfig;