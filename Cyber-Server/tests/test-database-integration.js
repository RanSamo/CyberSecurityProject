/**
 * Database Integration Test for PBKDF2 Password Implementation
 * Tests the full user lifecycle with the database
 */

require('dotenv').config();
const { pool } = require('../config/db');
const userModel = require('../models/user-model');

// Console styling for better readability
const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m'
};

// Helper to log steps and results
function logStep(step, message) {
  console.log(`\n${COLORS.BLUE}[STEP ${step}] ${message}${COLORS.RESET}`);
}

function logSuccess(message) {
  console.log(`${COLORS.GREEN}✓ SUCCESS: ${message}${COLORS.RESET}`);
}

function logFailure(message) {
  console.log(`${COLORS.RED}✗ FAILURE: ${message}${COLORS.RESET}`);
}

function logResult(result) {
  console.log(`${COLORS.CYAN}Result:${COLORS.RESET}`, JSON.stringify(result, null, 2));
}

// Main test function
async function testDatabaseIntegration() {
  console.log(`\n${COLORS.MAGENTA}===============================================`);
  console.log(`=== DATABASE INTEGRATION TEST - PBKDF2 PASSWORD ===`);
  console.log(`===============================================${COLORS.RESET}`);
  
  try {
    // Generate unique test email to avoid conflicts
    const testEmail = `test.user.${Date.now()}@example.com`;
    const initialPassword = 'SecurePass123!';
    const changedPassword = 'NewPass456!';
    const resetPassword = 'ResetPass789!';
    
    console.log(`${COLORS.YELLOW}Using test email: ${testEmail}${COLORS.RESET}`);
    
    let userId;
    let resetToken;
    
    //=====================================================
    // 1. Create a new user
    //=====================================================
    logStep(1, "Creating a new user with a secure password");
    
    const createResult = await userModel.createUserSecure(
      'Test',
      'User',
      testEmail,
      initialPassword
    );
    
    logResult(createResult);
    
    if (createResult.success && createResult.userId) {
      userId = createResult.userId;
      logSuccess(`User created with ID: ${userId}`);
    } else {
      logFailure("Failed to create user");
      throw new Error("User creation failed");
    }
    
    //=====================================================
    // 2. Login with correct password
    //=====================================================
    logStep(2, "Logging in with correct password");
    
    const loginResult = await userModel.verifyUserSecure(
      testEmail,
      initialPassword
    );
    
    logResult(loginResult);
    
    if (loginResult.success && loginResult.userId === userId) {
      logSuccess("Login successful");
    } else {
      logFailure("Login failed");
      throw new Error("Login failed with correct password");
    }
    
    //=====================================================
    // 3. Test login with incorrect password
    //=====================================================
    logStep(3, "Testing login with incorrect password (should fail)");
    
    const failedLoginResult = await userModel.verifyUserSecure(
      testEmail,
      "WrongPassword123!"
    );
    
    logResult(failedLoginResult);
    
    if (!failedLoginResult.success) {
      logSuccess("Login correctly failed with wrong password");
    } else {
      logFailure("Login incorrectly succeeded with wrong password");
      throw new Error("Security issue: Login succeeded with wrong password");
    }
    
    //=====================================================
    // 4. Change password
    //=====================================================
    logStep(4, "Changing password");
    
    const changePasswordResult = await userModel.changePassword(
      userId,
      initialPassword,
      changedPassword
    );
    
    logResult(changePasswordResult);
    
    if (changePasswordResult.success) {
      logSuccess("Password changed successfully");
    } else {
      logFailure("Failed to change password");
      throw new Error("Password change failed");
    }
    
    //=====================================================
    // 5. Login with new password
    //=====================================================
    logStep(5, "Logging in with new password");
    
    const newLoginResult = await userModel.verifyUserSecure(
      testEmail,
      changedPassword
    );
    
    logResult(newLoginResult);
    
    if (newLoginResult.success && newLoginResult.userId === userId) {
      logSuccess("Login with new password successful");
    } else {
      logFailure("Login with new password failed");
      throw new Error("Login failed after password change");
    }
    
    //=====================================================
    // 6. Try login with old password (should fail)
    //=====================================================
    logStep(6, "Trying login with old password (should fail)");
    
    const oldPasswordResult = await userModel.verifyUserSecure(
      testEmail,
      initialPassword
    );
    
    logResult(oldPasswordResult);
    
    if (!oldPasswordResult.success) {
      logSuccess("Login correctly failed with old password");
    } else {
      logFailure("Login incorrectly succeeded with old password");
      throw new Error("Security issue: Login succeeded with old password after change");
    }
    
    //=====================================================
    // 7. Request password reset
    //=====================================================
    logStep(7, "Requesting password reset");
    
    const resetRequestResult = await userModel.requestPasswordReset(testEmail);
    
    logResult(resetRequestResult);
    
    if (resetRequestResult.success && resetRequestResult.token) {
      resetToken = resetRequestResult.token;
      logSuccess(`Password reset requested, token: ${resetToken}`);
    } else {
      logFailure("Failed to request password reset");
      throw new Error("Password reset request failed");
    }
    
    //=====================================================
    // 8. Reset password with token
    //=====================================================
    logStep(8, "Resetting password with token");
    
    const resetResult = await userModel.resetPassword(
      resetToken,
      resetPassword
    );
    
    logResult(resetResult);
    
    if (resetResult.success) {
      logSuccess("Password reset successful");
    } else {
      logFailure("Failed to reset password");
      throw new Error("Password reset failed");
    }
    
    //=====================================================
    // 9. Login with reset password
    //=====================================================
    logStep(9, "Logging in with reset password");
    
    const resetLoginResult = await userModel.verifyUserSecure(
      testEmail,
      resetPassword
    );
    
    logResult(resetLoginResult);
    
    if (resetLoginResult.success && resetLoginResult.userId === userId) {
      logSuccess("Login with reset password successful");
    } else {
      logFailure("Login with reset password failed");
      throw new Error("Login failed after password reset");
    }
    
    //=====================================================
    // 10. Test password history with changed password (should fail)
    //=====================================================
    logStep(10, "Testing password history (trying to reuse old password)");
    
    const historyTestResult = await userModel.changePassword(
      userId,
      resetPassword,
      initialPassword // Try to reuse the initial password
    );
    
    logResult(historyTestResult);
    
    if (!historyTestResult.success && historyTestResult.message && 
        historyTestResult.message.includes("Cannot reuse")) {
      logSuccess("Password history check working correctly");
    } else if (historyTestResult.success) {
      logFailure("Password history check failed - allowed reuse of old password");
      throw new Error("Security issue: Password history validation failed");
    } else {
      logFailure(`Password history check failed with unexpected error: ${historyTestResult.message}`);
    }
    
    
    console.log(`\n${COLORS.GREEN}================================================`);
    console.log(`=== ALL TESTS PASSED - PBKDF2 IMPLEMENTATION WORKING ===`);
    console.log(`================================================${COLORS.RESET}`);
    
  } catch (error) {
    console.error(`\n${COLORS.RED}TEST FAILED:${COLORS.RESET}`, error.message);
  } finally {
    // Close database connection pool
    await pool.end();
  }
}

// Run the test
testDatabaseIntegration().catch(error => {
  console.error(`${COLORS.RED}An unexpected error occurred:${COLORS.RESET}`, error);
  process.exit(1);
});