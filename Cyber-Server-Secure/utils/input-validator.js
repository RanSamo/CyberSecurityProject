const ESAPI = require('node-esapi');
const validator = require('validator');

/**
 * Input validation and sanitization utilities
 * Uses ESAPI for encoding
 * Uses WHITELISTING approach 
 */
const inputValidator = {
  
  
   // Sanitize string input - basic cleaning without HTML encoding
  sanitizeString(input, maxLength = 255) {
    if (typeof input !== 'string') {
      return '';
    }
    
    // Trim whitespace
    let sanitized = input.trim();
    
    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    // Store raw data - HTML encoding will be done on output
    return sanitized;
  },

  
   //HTML encode data for safe web output using ESAPI
  htmlEncode(input) {
    if (typeof input !== 'string') {
      return '';
    }
    // Use ESAPI for HTML encoding
    return ESAPI.encoder().encodeForHTML(input);
  },

  
   //Validate and sanitize email (Uses validator.js for email validation, ESAPI for encoding)
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, sanitized: '', error: 'Email is required' };
    }

    const trimmed = email.trim();
    
    if (!trimmed) {
      return { isValid: false, sanitized: '', error: 'Email is required' };
    }

    // Check length limit (database: VARCHAR(100))
    if (trimmed.length > 100) {
      return { isValid: false, sanitized: trimmed, error: 'Email must be less than 100 characters' };
    }

    // WHITELISTING: validator.isEmail only allows valid email patterns
    if (!validator.isEmail(trimmed)) {
      return { isValid: false, sanitized: trimmed, error: 'Invalid email format' };
    }

    const normalized = validator.normalizeEmail(trimmed);
    return { isValid: true, sanitized: normalized };
  },

  
   // Validate phone number 
  validatePhone(phone) {
    if (typeof phone !== 'string') {
      return { isValid: false, sanitized: '', error: 'Invalid phone format' };
    }

    let sanitized = phone.trim();
    
    // Check length limit (database: VARCHAR(20))
    if (sanitized.length > 20) {
      return { isValid: false, sanitized: phone, error: 'Phone number must be less than 20 characters' };
    }

    // WHITELISTING: Only allow numbers, +, -, (, ), spaces, and dots
    const phoneWhitelist = /^[\+\-\(\)\s\.\d]+$/;
    if (!phoneWhitelist.test(sanitized)) {
      return { isValid: false, sanitized: phone, error: 'Phone number contains invalid characters. Only numbers, +, -, (, ), spaces, and dots allowed' };
    }

    // Remove formatting characters for further validation
    const digitsOnly = sanitized.replace(/[\s\-\(\)\.]/g, '');
    
    // WHITELISTING: Check if cleaned version contains only + and numbers
    if (!/^[\+]?[0-9]+$/.test(digitsOnly)) {
      return { isValid: false, sanitized: phone, error: 'Phone must contain only numbers and optional + symbol' };
    }

    // Check length (basic validation for digits only)
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return { isValid: false, sanitized: phone, error: 'Phone number must be 7-15 digits' };
    }

    return { isValid: true, sanitized: sanitized };
  },

  
   // Validate name using WHITELISTING approach (first name, last name)
  validateName(name, fieldName = 'Name', maxLength = 50) {
    if (!name || typeof name !== 'string') {
      return { isValid: false, sanitized: '', error: `${fieldName} is required` };
    }

    const trimmed = name.trim();
    
    if (!trimmed) {
      return { isValid: false, sanitized: '', error: `${fieldName} is required` };
    }

    if (trimmed.length < 1 || trimmed.length > maxLength) {
      return { isValid: false, sanitized: trimmed, error: `${fieldName} must be 1-${maxLength} characters` };
    }

    // WHITELISTING: Only allow safe characters for names
    // Letters (any language), numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, ampersand
    const nameWhitelist = /^[a-zA-ZÀ-ÿĀ-žА-я0-9\s\-'.,&()]+$/u;
    
    if (!nameWhitelist.test(trimmed)) {
      return { 
        isValid: false, 
        sanitized: trimmed, 
        error: `${fieldName} contains invalid characters. Only letters, numbers, spaces, hyphens, apostrophes, commas, periods, parentheses, and ampersand are allowed` 
      };
    }

    // Additional check: Reject if it's mostly special characters (potential abuse)
    const letterCount = (trimmed.match(/[a-zA-ZÀ-ÿĀ-žА-я]/gu) || []).length;
    const totalLength = trimmed.length;
    
    if (letterCount < totalLength * 0.5 && totalLength > 2) {
      return { 
        isValid: false, 
        sanitized: trimmed, 
        error: `${fieldName} must contain primarily letters` 
      };
    }

    const sanitized = this.sanitizeString(trimmed, maxLength);
    return { isValid: true, sanitized: sanitized };
  },

  
  //Validate address using WHITELISTING approach
   
  validateAddress(address) {
    if (typeof address !== 'string') {
      return { isValid: false, sanitized: '', error: 'Invalid address format' };
    }

    const trimmed = address.trim();
    
    // Check length limit (database: VARCHAR(255))
    if (trimmed.length > 255) {
      return { isValid: false, sanitized: trimmed, error: 'Address must be less than 255 characters' };
    }

    // WHITELISTING: Allow typical address characters
    // Letters, numbers, spaces, common punctuation for addresses
    const addressWhitelist = /^[a-zA-ZÀ-ÿĀ-žА-я0-9\s\-'.,&#/()]+$/u;
    
    if (!addressWhitelist.test(trimmed)) {
      return { 
        isValid: false, 
        sanitized: trimmed, 
        error: 'Address contains invalid characters. Only letters, numbers, spaces, and common punctuation are allowed' 
      };
    }

    const sanitized = this.sanitizeString(trimmed, 255);
    return { isValid: true, sanitized: sanitized };
  },

  
  //Validate package selection 
   
  validatePackage(packageLevel) {
    // WHITELISTING: Only allow these exact three packages
    const allowedPackages = ['100 Mb', '200 Mb', '300 Mb'];
    
    if (!packageLevel) {
      return { isValid: true, sanitized: '100 Mb' }; // Default to 100 Mb
    }

    if (typeof packageLevel !== 'string') {
      return { isValid: false, sanitized: '100 Mb', error: 'Invalid package format' };
    }

    const trimmed = packageLevel.trim();
    
    // Check length limit (database: VARCHAR(255))
    if (trimmed.length > 255) {
      return { isValid: false, sanitized: '100 Mb', error: 'Package name too long' };
    }
    
    // WHITELISTING: Strict exact match validation
    if (!allowedPackages.includes(trimmed)) {
      return { isValid: false, sanitized: '100 Mb', error: 'Invalid package selection. Must be 100 Mb, 200 Mb, or 300 Mb' };
    }

    return { isValid: true, sanitized: trimmed };
  },

  
   //Validate user names (for registration)
  validateUserNames(firstName, lastName) {
    const errors = [];
    const sanitizedData = {};

    // Validate first name (database: VARCHAR(50))
    const firstNameResult = this.validateName(firstName, 'First name', 50);
    if (!firstNameResult.isValid) {
      errors.push(firstNameResult.error);
    }
    sanitizedData.firstName = firstNameResult.sanitized;

    // Validate last name (database: VARCHAR(50))
    const lastNameResult = this.validateName(lastName, 'Last name', 50);
    if (!lastNameResult.isValid) {
      errors.push(lastNameResult.error);
    }
    sanitizedData.lastName = lastNameResult.sanitized;

    return {
      isValid: errors.length === 0,
      sanitizedData: sanitizedData,
      errors: errors
    };
  },

  
  // Validate all client data at once 
  validateClientData(clientData) {
    const errors = [];
    const sanitizedData = {};

    // Validate first name (database: VARCHAR(100) for clients)
    const firstNameResult = this.validateName(clientData.firstName, 'First name', 100);
    if (!firstNameResult.isValid) {
      errors.push(firstNameResult.error);
    }
    sanitizedData.firstName = firstNameResult.sanitized;

    // Validate last name (database: VARCHAR(50))
    const lastNameResult = this.validateName(clientData.lastName, 'Last name', 50);
    if (!lastNameResult.isValid) {
      errors.push(lastNameResult.error);
    }
    sanitizedData.lastName = lastNameResult.sanitized;

    // Validate email (database: VARCHAR(100))
    const emailResult = this.validateEmail(clientData.cEmail || clientData.email);
    if (!emailResult.isValid) {
      errors.push(emailResult.error);
    }
    sanitizedData.email = emailResult.sanitized;

    // Validate phone (database: VARCHAR(20))
    const phoneResult = this.validatePhone(clientData.phoneNumber || clientData.phone);
    if (!phoneResult.isValid) {
      errors.push(phoneResult.error);
    }
    sanitizedData.phone = phoneResult.sanitized;

    // Validate address (database: VARCHAR(255))
    const addressResult = this.validateAddress(clientData.address);
    if (!addressResult.isValid) {
      errors.push(addressResult.error);
    }
    sanitizedData.address = addressResult.sanitized;

    // Validate package (database: VARCHAR(255))
    const packageResult = this.validatePackage(clientData.packageLevel || clientData.package);
    if (!packageResult.isValid) {
      errors.push(packageResult.error);
    }
    sanitizedData.package = packageResult.sanitized;

    return {
      isValid: errors.length === 0,
      sanitizedData: sanitizedData,
      errors: errors
    };
  },

  
  //Validate user registration data
  validateUserRegistration(userData) {
    const errors = [];
    const sanitizedData = {};

    // Validate names
    const nameResult = this.validateUserNames(userData.firstName, userData.lastName);
    if (!nameResult.isValid) {
      errors.push(...nameResult.errors);
    }
    sanitizedData.firstName = nameResult.sanitizedData.firstName;
    sanitizedData.lastName = nameResult.sanitizedData.lastName;

    // Validate email
    const emailResult = this.validateEmail(userData.uEmail);
    if (!emailResult.isValid) {
      errors.push(emailResult.error);
    }
    sanitizedData.uEmail = emailResult.sanitized;

    // Note: Password validation is handled separately by password-validator.js

    return {
      isValid: errors.length === 0,
      sanitizedData: sanitizedData,
      errors: errors
    };
  }
};

module.exports = inputValidator;