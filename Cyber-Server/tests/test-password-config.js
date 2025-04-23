// test-password-config.js
const { validatePassword, updatePasswordConfig, getPasswordConfig } = require('../password-validator');

async function testPasswordConfig() {
  console.log('======= TESTING PASSWORD CONFIGURATION AND VALIDATION =======');
  
  try {
    // 1. Display current configuration
    console.log('\n=== CURRENT PASSWORD CONFIGURATION ===');
    const config = getPasswordConfig();
    console.log(`Minimum Length: ${config.minLength} characters`);
    console.log('Complexity Requirements:');
    console.log(`  - Uppercase letters: ${config.complexity.requireUppercase ? 'Required' : 'Not required'}`);
    console.log(`  - Lowercase letters: ${config.complexity.requireLowercase ? 'Required' : 'Not required'}`);
    console.log(`  - Numbers: ${config.complexity.requireNumbers ? 'Required' : 'Not required'}`);
    console.log(`  - Special characters: ${config.complexity.requireSpecial ? 'Required' : 'Not required'}`);
    console.log(`Password history check: ${config.history.count} previous passwords`);
    console.log(`Maximum login attempts: ${config.loginAttempts.max}`);
    console.log(`Dictionary check enabled: ${config.dictionary.enabled ? 'Yes' : 'No'}`);
    console.log(`Number of dictionary words: ${config.dictionary.words.length}`);
    
    // Display the first few dictionary words
    console.log('\nSome forbidden dictionary words:');
    console.log(config.dictionary.words.slice(0, 10).join(', '));
    
    // 2. Test various passwords with detailed output
    console.log('\n=== PASSWORD VALIDATION TESTS ===');
    
    const testPasswords = [
      { password: 'short', desc: 'Too short password' },
      { password: 'longpassword', desc: 'Long but missing complexity' },
      { password: 'nouppercase123!', desc: 'No uppercase letter' },
      { password: 'NOLOWERCASE123!', desc: 'No lowercase letter' },
      { password: 'NoNumbers!', desc: 'No numbers' },
      { password: 'NoSpecialChars123', desc: 'No special characters' },
      { password: 'Admin@123456', desc: 'Contains dictionary word "admin" and "123456"' },
      { password: 'Password123!', desc: 'Contains dictionary word "password"' },
      { password: 'Qwerty123!', desc: 'Contains dictionary word "qwerty"' },
      { password: 'Secure$Pw9876', desc: 'Valid password with all requirements' },
      { password: 'C0mplex!Password', desc: 'Another valid password' }
    ];
    
    for (const test of testPasswords) {
      console.log('\n------------------------------------------');
      console.log(`TESTING PASSWORD: "${test.password}"`);
      console.log(`Description: ${test.desc}`);
      
      const validationResult = await validatePassword(test.password);
      
      if (validationResult.valid) {
        console.log('RESULT: ✓ Password is VALID');
      } else {
        console.log('RESULT: ✗ Password is INVALID');
        console.log('Reasons:');
        validationResult.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    }
    
    // 3. Test specific cases for dictionary words
    console.log('\n=== TESTING SPECIFIC DICTIONARY WORD CASES ===');
    
    const dictionaryTests = [
      { password: 'Admin@Pass123', desc: 'Contains "admin"' },
      { password: 'Strong123456!', desc: 'Contains "123456"' },
      { password: 'MyP@ssword123', desc: 'Contains "password"' },
      { password: 'SecureWelcome1!', desc: 'Contains "welcome"' },
      { password: 'LetMeIn2023!', desc: 'Contains "letmein"' }
    ];
    
    for (const test of dictionaryTests) {
      console.log('\n------------------------------------------');
      console.log(`TESTING PASSWORD: "${test.password}"`);
      console.log(`Description: ${test.desc}`);
      
      const validationResult = await validatePassword(test.password);
      
      if (validationResult.valid) {
        console.log('RESULT: ✓ Password is VALID');
      } else {
        console.log('RESULT: ✗ Password is INVALID');
        console.log('Reasons:');
        validationResult.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    }
    
    // 4. Test with custom password if provided as command-line argument
    const customPassword = process.argv[2];
    if (customPassword) {
      console.log('\n=== TESTING CUSTOM PASSWORD ===');
      console.log(`TESTING PASSWORD: "${customPassword}"`);
      
      const validationResult = await validatePassword(customPassword);
      
      if (validationResult.valid) {
        console.log('RESULT: ✓ Password is VALID');
      } else {
        console.log('RESULT: ✗ Password is INVALID');
        console.log('Reasons:');
        validationResult.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    }
    
    // 5. Test configuration updates
    console.log('\n=== TESTING CONFIGURATION UPDATES ===');
    
    // Save original config for later restoration
    // Using JSON parse/stringify for a complete deep copy
    const originalConfig = JSON.parse(JSON.stringify(getPasswordConfig()));
    
    // Update configuration
    console.log('Updating password configuration...');
    const updateResult = updatePasswordConfig({
      minLength: 8,  // Reduced minimum length
      complexity: {
        requireSpecial: false  // No longer require special characters
      },
      dictionary: {
        enabled: false  // Disable dictionary check
      }
    });
    
    console.log(`Configuration update result: ${updateResult.success ? 'Successful' : 'Failed'}`);
    
    // Get updated configuration
    const updatedConfig = getPasswordConfig();
    console.log('\nUpdated Configuration:');
    console.log(`Minimum Length: ${updatedConfig.minLength} characters`);
    console.log('Complexity Requirements:');
    console.log(`  - Special characters: ${updatedConfig.complexity.requireSpecial ? 'Required' : 'Not required'}`);
    console.log(`Dictionary check enabled: ${updatedConfig.dictionary.enabled ? 'Yes' : 'No'}`);
    
    // Test passwords that should now pass with updated config
    console.log('\nTesting passwords with updated configuration:');
    
    const updatedConfigTests = [
      { password: 'Short123', desc: 'Shorter password (8 chars)' },
      { password: 'NoSpecialChars123', desc: 'No special characters' },
      { password: 'Password123', desc: 'Contains dictionary word but dictionary check disabled' }
    ];
    
    for (const test of updatedConfigTests) {
      console.log('\n------------------------------------------');
      console.log(`TESTING PASSWORD: "${test.password}"`);
      console.log(`Description: ${test.desc}`);
      
      const validationResult = await validatePassword(test.password);
      
      if (validationResult.valid) {
        console.log('RESULT: ✓ Password is VALID with updated config');
      } else {
        console.log('RESULT: ✗ Password is INVALID with updated config');
        console.log('Reasons:');
        validationResult.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }
    }
    
    // Restore original configuration with explicit setting of all fields
    updatePasswordConfig({
      minLength: originalConfig.minLength,
      complexity: {
        requireUppercase: originalConfig.complexity.requireUppercase,
        requireLowercase: originalConfig.complexity.requireLowercase,
        requireNumbers: originalConfig.complexity.requireNumbers,
        requireSpecial: originalConfig.complexity.requireSpecial
      },
      history: {
        count: originalConfig.history.count
      },
      dictionary: {
        enabled: originalConfig.dictionary.enabled,
        words: originalConfig.dictionary.words
      },
      loginAttempts: {
        max: originalConfig.loginAttempts.max
      }
    });
    console.log('\nConfiguration restored to original settings');
    
    // Verify restore worked
    const restoredConfig = getPasswordConfig();
    console.log(`Minimum Length: ${restoredConfig.minLength} characters`);
    console.log(`Dictionary check enabled: ${restoredConfig.dictionary.enabled ? 'Yes' : 'No'}`);
    
    console.log('\n============ ALL PASSWORD CONFIGURATION TESTS COMPLETED ============');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the tests
testPasswordConfig()
  .then(() => {
    console.log('Testing completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error during testing:', error);
    process.exit(1);
  });