const userModel = require('../models/user-model.js');
const customerModel = require('../models/customer-model.js');
const { pool } = require('../db');
const { validatePassword } = require('../password-validator');

async function testImplementation() {
  console.log('Testing project implementation...');
  const connection = await pool.getConnection();

  try {
    // 1. Test user registration
    console.log('\n=== Testing user registration ===');
    const testUser = {
      username: 'testuser' + Math.floor(Math.random() * 1000),
      email: `testuser${Math.floor(Math.random() * 1000)}@example.com`,
      password: 'Test@0505555555'
    };
    
    console.log('Creating a new user...');
    const createResult = await userModel.createUserSecure(
      testUser.username, 
      testUser.email, 
      testUser.password
    );
    
    console.log('Result:', createResult);
    if (!createResult.success) {
      throw new Error('Failed to create user');
    }
    
    // 2. Test login
    console.log('\n=== Testing user login ===');
    const loginResult = await userModel.verifyUserSecure(testUser.username, testUser.password);
    console.log('Login result:', loginResult);
    if (!loginResult.success) {
      throw new Error('Failed to login');
    }
    
    // 3. Test password validation
    console.log('\n=== Testing password validation ===');
    const validationTests = [
      { password: 'short', desc: 'Too short password' },
      { password: 'nouppercase123!', desc: 'No uppercase letter' },
      { password: 'NOLOWERCASE123!', desc: 'No lowercase letter' },
      { password: 'NoNumbers!', desc: 'No numbers' },
      { password: 'NoSpecialChars123', desc: 'No special characters' },
      { password: 'Password123!', desc: 'Contains dictionary word "password"' },
      { password: 'Good@Password123', desc: 'Valid password' }
    ];
    
    for (const test of validationTests) {
      console.log(`Testing: ${test.desc}`);
      const validationResult = await validatePassword(test.password);
      console.log('Valid:', validationResult.valid);
      if (!validationResult.valid) {
        console.log('Errors:', validationResult.errors);
      }
    }
    
    // 4. Test password change
    console.log('\n=== Testing password change ===');
    const newPassword = 'NewPass@456789';
    const changeResult = await userModel.changePassword(
      loginResult.userId,
      testUser.password,
      newPassword
    );
    console.log('Password change result:', changeResult);
    
    // 5. Test password history restriction
    console.log('\n=== Testing password history restriction ===');
    const historyTestResult = await userModel.changePassword(
      loginResult.userId,
      newPassword,
      testUser.password // Try to reuse the original password
    );
    console.log('Password history test result:', historyTestResult);
    
    // 6. Test password reset
    console.log('\n=== Testing password reset ===');
    const resetRequestResult = await userModel.requestPasswordReset(testUser.email);
    console.log('Reset request result:', resetRequestResult);
    
    if (resetRequestResult.success && resetRequestResult.token) {
      const resetResult = await userModel.resetPassword(
        resetRequestResult.token,
        'ResetPass@123456'
      );
      console.log('Password reset result:', resetResult);
    }
    
    // 7. Test customer creation (secure)
    console.log('\n=== Testing customer creation ===');
    const testCustomer = {
      firstName: 'Test',
      lastName: 'Customer',
      email: `customer${Math.floor(Math.random() * 1000)}@example.com`,
      phone: '555-123-4567',
      address: '123 Test St',
      package: 'Basic 50Mbps',
    };
    
    const createCustomerResult = await customerModel.createCustomerSecure(testCustomer);
    console.log('Create customer result:', createCustomerResult);
    
    // 8. Test customer search
    console.log('\n=== Testing customer search ===');
    const searchResult = await customerModel.getCustomersSecure('Test');
    console.log('Search result count:', searchResult.customers?.length);

    // 9. Test account locking after failed login attempts
console.log('\n=== Testing account locking after failed login attempts ===');
  
// We'll use the previously created test user with a deliberately wrong password
const wrongPassword = 'WrongPassword123!';
const maxAttempts = 3; // This should match your config

console.log(`Attempting ${maxAttempts} failed logins to trigger account lock...`);

// Try logging in with wrong password multiple times
for (let i = 1; i <= maxAttempts; i++) {
  console.log(`\nAttempt ${i}/${maxAttempts}:`);
  const failedLoginResult = await userModel.verifyUserSecure(testUser.username, wrongPassword);
  console.log(`Login successful: ${failedLoginResult.success}`);
  console.log(`Message: ${failedLoginResult.message || 'No message'}`);
}

// Now verify that the account is locked by trying with the correct password
console.log('\nTrying correct password after account should be locked:');
const lockedLoginResult = await userModel.verifyUserSecure(testUser.username, newPassword);
console.log(`Login successful: ${lockedLoginResult.success}`);
console.log(`Message: ${lockedLoginResult.message || 'No message'}`);

// Verify account lock status in database
const [lockedUser] = await connection.query(
  'SELECT account_locked, failed_login_attempts FROM users WHERE username = ?', 
  [testUser.username]
);

console.log('\nAccount status in database:');
console.log(`Account locked: ${lockedUser[0].account_locked ? 'Yes' : 'No'}`);
console.log(`Failed login attempts: ${lockedUser[0].failed_login_attempts}`);

if (lockedUser[0].account_locked) {
  console.log('PASS: Account was successfully locked after multiple failed attempts');
} else {
  console.log('FAIL: Account was not locked after multiple failed attempts');
}
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test error:', error);
  }
  finally {
    connection.release();
  }

}

// Run the tests
testImplementation()
  .then(() => {
    console.log('Testing completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during testing:', error);
    process.exit(1);
  });