const userModel = require('../models/user-model.js');
const customerModel = require('../models/customer-model.js');
const { pool } = require('../config/db.js');
const { validatePassword } = require('../utils/password-validator.js');

async function testImplementation() {
  console.log('Testing project implementation...');
  const connection = await pool.getConnection();

  try {
    // 1. Test user registration
    console.log('\n=== Testing user registration ===');
    const testUser = {
      email: `testuser${Math.floor(Math.random() * 1000)}@example.com`,
      password: 'Test@0505555555'
    };
    
    console.log('Creating a new user...');
    const createResult = await userModel.createUserSecure(
      testUser.email, 
      testUser.password
    );
    
    console.log('Result:', createResult);
    if (!createResult.success) {
      throw new Error('Failed to create user');
    }
    
    // 2. Test login
    console.log('\n=== Testing user login ===');
    const loginResult = await userModel.verifyUserSecure(testUser.email, testUser.password);
    console.log('Login result:', loginResult);
    if (!loginResult.success) {
      throw new Error('Failed to login');
    }
    
    // Store userId for later use
    const userId = loginResult.userId;
    
    // 3. Test password validation
    console.log('\n=== Testing password validation ===');
    const validationTests = [
      { password: 'short', desc: 'Too short password' },
      { password: 'nouppercase123!', desc: 'No uppercase letter' },
      { password: 'NOLOWERCASE123!', desc: 'No lowercase letter' },
      { password: 'NoNumbers!', desc: 'No numbers' },
      { password: 'NoSpecialChars123', desc: 'No special characters' },
      { password: 'Password123!', desc: 'Contains dictionary word "password"' },
      { password: 'Good@Pass123', desc: 'Valid password' }
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
      userId,
      testUser.password,
      newPassword
    );
    console.log('Password change result:', changeResult);
    
    // 5. Test password history restriction
    console.log('\n=== Testing password history restriction ===');
    const historyTestResult = await userModel.changePassword(
      userId,
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
        'ResetPass@56'
      );
      console.log('Password reset result:', resetResult);
    }
    
    // 7. Test customer creation with user_id (secure)
    console.log('\n=== Testing customer creation with user_id ===');
    const testCustomer = {
      firstName: 'Test',
      lastName: 'Customer',
      email: `customer${Math.floor(Math.random() * 1000)}@example.com`,
      phone: '555-123-4567',
      address: '123 Test St',
      package: 'Basic 50Mbps',
    };
    
    const createCustomerResult = await customerModel.createCustomerSecure(testCustomer, userId);
    console.log('Create customer result:', createCustomerResult);
    
    if (!createCustomerResult.success) {
      throw new Error('Failed to create customer');
    }
    
    const customerId = createCustomerResult.customerId;
    
    // 8. Test customer search with user_id
    console.log('\n=== Testing customer search with user_id ===');
    const searchResult = await customerModel.getCustomersSecure('Test', userId);
    console.log('Search result count:', searchResult.customers?.length);
    
    // 9. Test getting all customers for a user
    console.log('\n=== Testing get all customers for user ===');
    const allCustomersResult = await customerModel.getAllCustomersForUserSecure(userId);
    console.log('All customers count:', allCustomersResult.customers?.length);
    
    // 10. Test get customer by ID with user_id
    console.log('\n=== Testing get customer by ID with user_id ===');
    const getCustomerResult = await customerModel.getCustomerByIdSecure(customerId, userId);
    console.log('Get customer result:', getCustomerResult.success);
    
    // 11. Test update customer with user_id
    console.log('\n=== Testing update customer with user_id ===');
    const updateCustomer = {
      firstName: 'Updated',
      lastName: 'Customer',
      email: testCustomer.email,
      phone: '555-987-6543',
      address: '456 Update Ave',
      package: 'Premium 100Mbps',
    };
    
    const updateResult = await customerModel.updateCustomerSecure(customerId, updateCustomer, userId);
    console.log('Update customer result:', updateResult);
    
    // 12. Test multi-user isolation
    console.log('\n=== Testing multi-user isolation ===');
    
    // Create a second user
    const secondUser = {
      email: `seconduser${Math.floor(Math.random() * 1000)}@example.com`,
      password: 'Second@Pass123'
    };
    
    const createSecondUserResult = await userModel.createUserSecure(
      secondUser.email, 
      secondUser.password
    );
    
    if (!createSecondUserResult.success) {
      throw new Error('Failed to create second user');
    }
    
    const secondUserId = createSecondUserResult.userId;
    
    // Try to access first user's customer with second user's ID
    const isolationTestResult = await customerModel.getCustomerByIdSecure(customerId, secondUserId);
    console.log('Isolation test result:', isolationTestResult);
    
    if (!isolationTestResult.success) {
      console.log('PASS: Second user cannot access first user\'s customer');
    } else {
      console.log('FAIL: Second user should not be able to access first user\'s customer');
    }
    
    // 13. Test delete customer with user_id
    console.log('\n=== Testing delete customer with user_id ===');
    const deleteResult = await customerModel.deleteCustomerSecure(customerId, userId);
    console.log('Delete customer result:', deleteResult);

    // 14. Test account locking after failed login attempts
    console.log('\n=== Testing account locking after failed login attempts ===');
    
    // We'll use the previously created test user with a deliberately wrong password
    const wrongPassword = 'WrongPassword123!';
    const maxAttempts = 3; // This should match your config
    
    console.log(`Attempting ${maxAttempts} failed logins to trigger account lock...`);
    
    // Try logging in with wrong password multiple times
    for (let i = 1; i <= maxAttempts; i++) {
      console.log(`\nAttempt ${i}/${maxAttempts}:`);
      const failedLoginResult = await userModel.verifyUserSecure(testUser.email, wrongPassword);
      console.log(`Login successful: ${failedLoginResult.success}`);
      console.log(`Message: ${failedLoginResult.message || 'No message'}`);
    }
    
    // Now verify that the account is locked by trying with the correct password
    console.log('\nTrying correct password after account should be locked:');
    const lockedLoginResult = await userModel.verifyUserSecure(testUser.email, newPassword);
    
    console.log(`Login successful: ${lockedLoginResult.success}`);
    console.log(`Message: ${lockedLoginResult.message || 'No message'}`);
    
    // Verify account lock status in database
    const [lockedUser] = await connection.query(
      'SELECT account_locked, failed_login_attempts FROM users WHERE email = ?', 
      [testUser.email]
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