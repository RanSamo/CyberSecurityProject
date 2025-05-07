/**
 * Simple Test Script for Password Security Implementation
 * This script uses Node.js built-in assert module - no external dependencies required.
 */

const assert = require('assert');
const securityUtils = require('../utils/security-utils');
require('dotenv').config();

// Console styling for better readability
const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m'
};

let testsPassed = 0;
let testsFailed = 0;

// Test wrapper function
async function test(name, fn) {
  console.log(`\n${COLORS.BLUE}[TEST] ${name}${COLORS.RESET}`);
  try {
    await fn();
    console.log(`${COLORS.GREEN}[PASS] ${name}${COLORS.RESET}`);
    testsPassed++;
    return true;
  } catch (error) {
    console.error(`${COLORS.RED}[FAIL] ${name}${COLORS.RESET}`);
    console.error(`       ${error.message}`);
    testsFailed++;
    return false;
  }
}

// Test security utils implementation
async function testSecurityUtils() {
  console.log(`\n${COLORS.MAGENTA}=== Testing Security Utils ===${COLORS.RESET}`);

  // Test salt generation
  await test('Salt generation produces different salts', () => {
    const salt1 = securityUtils.generateSalt();
    const salt2 = securityUtils.generateSalt();
    
    assert.notEqual(salt1, salt2, 'Expected different salts');
    assert.equal(salt1.length, 64, 'Expected 64-character hex string');
  });

  // Test password hashing
  await test('Password hashing is deterministic with same salt', async () => {
    const password = 'TestPassword123!';
    const salt = securityUtils.generateSalt();
    
    const hash1 = await securityUtils.hashPassword(password, salt);
    const hash2 = await securityUtils.hashPassword(password, salt);
    
    assert.equal(hash1, hash2, 'Expected identical hashes for same password+salt');
  });
  
  await test('Password hashing produces different hashes with different passwords', async () => {
    const salt = securityUtils.generateSalt();
    
    const hash1 = await securityUtils.hashPassword('Password1!', salt);
    const hash2 = await securityUtils.hashPassword('Password2!', salt);
    
    assert.notEqual(hash1, hash2, 'Expected different hashes for different passwords');
  });

  // Test password verification
  await test('Password verification works correctly for matching password', async () => {
    const password = 'SecurePassword123!';
    const salt = securityUtils.generateSalt();
    const hash = await securityUtils.hashPassword(password, salt);
    
    const result = await securityUtils.verifyPassword(password, hash, salt);
    assert.equal(result, true, 'Expected verification to succeed for correct password');
  });
  
  await test('Password verification fails for incorrect password', async () => {
    const password = 'SecurePassword123!';
    const wrongPassword = 'WrongPassword123!';
    const salt = securityUtils.generateSalt();
    const hash = await securityUtils.hashPassword(password, salt);
    
    const result = await securityUtils.verifyPassword(wrongPassword, hash, salt);
    assert.equal(result, false, 'Expected verification to fail for incorrect password');
  });
}

// Test reset token generation
async function testResetToken() {
  console.log(`\n${COLORS.MAGENTA}=== Testing Reset Token Generation ===${COLORS.RESET}`);

  await test('Reset token is a valid SHA-1 hash (40 hex chars)', () => {
    const token = securityUtils.generateResetToken();
    
    assert.equal(token.length, 40, 'Expected 40-character SHA-1 hash');
    assert.match(token, /^[0-9a-f]{40}$/, 'Expected valid hex string');
  });
  
  await test('Reset tokens are unique', () => {
    const token1 = securityUtils.generateResetToken();
    const token2 = securityUtils.generateResetToken();
    
    assert.notEqual(token1, token2, 'Expected different tokens');
  });
}

// Test PBKDF2 performance
async function testPerformance() {
  console.log(`\n${COLORS.MAGENTA}=== Testing PBKDF2 Performance ===${COLORS.RESET}`);

  await test('Password hashing takes significant time (security check)', async () => {
    const password = 'TestPassword123!';
    const salt = securityUtils.generateSalt();
    
    const start = Date.now();
    await securityUtils.hashPassword(password, salt);
    const duration = Date.now() - start;
    
    console.log(`  Hashing time: ${duration}ms`);
    
    // Should take at least 50ms with 100,000 iterations on modern hardware
    // If it's faster, the implementation might not be as secure as expected
    assert(duration > 50, `Hashing too fast (${duration}ms), implementation may not be secure`);
    
    // If it's extremely slow (>1s), it might affect user experience
    if (duration > 1000) {
      console.log(`${COLORS.YELLOW}[WARNING] Hashing time is over 1 second, might impact user experience${COLORS.RESET}`);
    }
  });
}

// Main test runner
async function runTests() {
  console.log(`${COLORS.MAGENTA}====================================================`);
  console.log(`=== PBKDF2 PASSWORD HASHING IMPLEMENTATION TESTS ===`);
  console.log(`====================================================${COLORS.RESET}`);
  
  const startTime = Date.now();
  
  await testSecurityUtils();
  await testResetToken();
  await testPerformance();
  
  const duration = (Date.now() - startTime) / 1000;
  
  console.log(`\n${COLORS.MAGENTA}====================================================`);
  console.log(`RESULTS: ${COLORS.GREEN}${testsPassed} passed${COLORS.MAGENTA}, ${testsFailed > 0 ? COLORS.RED : COLORS.MAGENTA}${testsFailed} failed${COLORS.MAGENTA}`);
  console.log(`TOTAL TIME: ${duration.toFixed(2)} seconds`);
  console.log(`====================================================${COLORS.RESET}`);
  
  if (testsFailed > 0) {
    console.log(`${COLORS.RED}Some tests failed. Please check the implementation.${COLORS.RESET}`);
    process.exit(1);
  } else {
    console.log(`${COLORS.GREEN}All tests passed! The implementation is working correctly.${COLORS.RESET}`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`${COLORS.RED}An error occurred while running tests:${COLORS.RESET}`, error);
  process.exit(1);
});