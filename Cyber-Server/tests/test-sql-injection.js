const userModel = require('../models/user-model.js');
const customerModel = require('../models/customer-model.js');
const { pool } = require('../db');

async function testSqlInjection() {
  console.log('=====================================');
  console.log('TESTING SQL INJECTION VULNERABILITIES');
  console.log('=====================================');
  console.log('This test demonstrates SQL injection vulnerabilities in our application');
  console.log('and how parameterized queries protect against them.');
  console.log('\n');
  
  try {
    const connection = await pool.getConnection();
    
    // ======== TEST 1: SQL INJECTION IN CUSTOMER SEARCH ========
    console.log('TEST 1: SQL INJECTION IN CUSTOMER SEARCH (Part A, Section 4)');
    console.log('------------------------------------------------');
    
    // First, do a normal search that should find few results
    console.log('Step 1: Normal search for a specific term:');
    const normalSearch = await customerModel.getCustomersVulnerable('UnlikelyName');
    console.log(`Result: Found ${normalSearch.customers?.length} customers\n`);
    
    // Now try an SQL injection that should return ALL customers
    console.log('Step 2: Malicious search using SQL injection:');
    console.log('Injection string: \'' + "' OR '1'='1" + '\'');
    console.log('This injection makes the WHERE clause always true, returning all records\n');
    
    const allCustomers = await customerModel.getCustomersVulnerable("' OR '1'='1");
    console.log(`Result: Found ${allCustomers.customers?.length} customers`);
    
    if (allCustomers.customers?.length > normalSearch.customers?.length) {
      console.log('VULNERABILITY CONFIRMED: The SQL injection returned more customers than the normal search!');
      console.log('This demonstrates a serious SQL injection vulnerability.\n');
      
      // Show the actual vulnerable query
      console.log('The vulnerable query that was executed looks like:');
      console.log(`SELECT * FROM customers WHERE first_name LIKE '%' OR '1'='1%' OR last_name LIKE '%' OR '1'='1%' OR email LIKE '%' OR '1'='1%'`);
      console.log('Notice how the injection made the WHERE clause always true by adding OR \'1\'=\'1\'\n');
    }
    
    // ======== TEST 2: SQL INJECTION IN USER REGISTRATION ========
console.log('\nTEST 2: SQL INJECTION IN USER REGISTRATION (Part A, Section 1)');
console.log('---------------------------------------------------');

// Define a malicious payload that will create an admin user
const maliciousUsername = "hacker";
const maliciousEmail = "normal@example.com', 'fake_hash', 'fake_salt', TRUE); -- ";

console.log('Malicious registration input:');
console.log(`Username: ${maliciousUsername}`);
console.log(`Email: ${maliciousEmail}`);
console.log('The \' character breaks out of the string, and the -- comments out the rest of the query\n');

// Show what the vulnerable query would look like
console.log('The vulnerable query would execute as:');
const vulnerableQuery = `INSERT INTO users (username, email, password_hash, salt, is_admin) 
                      VALUES ('${maliciousUsername}', '${maliciousEmail}')`;
console.log(vulnerableQuery);
console.log('This should create a user with admin privileges!\n');

// Actually execute the vulnerable query to demonstrate the real injection
console.log('Executing the vulnerable query to create user with SQL injection...');
try {
  // Using direct string concatenation to demonstrate vulnerability
  await connection.query(`INSERT INTO users (username, email, password_hash, salt, is_admin) 
                       VALUES ('${maliciousUsername}', '${maliciousEmail}')`);
  
  // Verify the user was created with admin privileges
  const [results] = await connection.query(`SELECT * FROM users WHERE username = '${maliciousUsername}'`);
  
  if (results.length > 0) {
    console.log('User successfully created with SQL injection!');
    console.log('User details:', results[0]);
    console.log(`Admin status: ${results[0].is_admin ? 'YES - ADMIN USER CREATED!' : 'No'}`);
    
    if (results[0].is_admin) {
      console.log('VULNERABILITY CONFIRMED: Successfully created an admin user through SQL injection!');
    }
  } else {
    console.log('Failed to create user with SQL injection.');
  }
} catch (error) {
  console.error('Error during SQL injection test:', error);
}

// Cleanup - remove the test user (optional)
console.log('\nCleaning up - removing test user...');
await connection.query(`DELETE FROM users WHERE username = '${maliciousUsername}'`);
    
    // ======== TEST 3: SQL INJECTION IN LOGIN ========
    console.log('\nTEST 3: SQL INJECTION IN LOGIN (Part A, Section 3)');
    console.log('-------------------------------------------');
    
    // Show how login can be bypassed with SQL injection
    const anotherMaliciousUsername = "' OR '1'='1";
    console.log('Malicious login input:');
    console.log(`Username: ${anotherMaliciousUsername}`);
    console.log('Password: anything (doesn\'t matter with the injection)\n');
    
    // Show the vulnerable query
    console.log('When using string concatenation, the query becomes:');
    console.log(`SELECT * FROM users WHERE username = '${anotherMaliciousUsername}'`);
    console.log('Which evaluates to:');
    console.log(`SELECT * FROM users WHERE username = '' OR '1'='1'`);
    console.log('Since 1=1 is always true, this will return ALL users!\n');
    
    // Execute the query to prove the vulnerability
    console.log('Running this query directly to demonstrate the vulnerability:');
    const [users] = await connection.query(`SELECT * FROM users WHERE username = '${anotherMaliciousUsername}'`);
    console.log(`Result: Query returned ${users.length} users`);
    
    if (users.length > 0) {
      console.log('VULNERABILITY CONFIRMED: SQL injection returned user data without knowing valid credentials!\n');
    }
    
    // ======== TEST 4: SECURE IMPLEMENTATION WITH PARAMETERIZED QUERIES ========
    console.log('\nTEST 4: SECURE IMPLEMENTATION (Part B, Section 4)');
    console.log('----------------------------------------------');
    
    console.log('Now testing the secure version that uses parameterized queries...\n');
    
    // Test the secure version of customer search with the same injection string
    console.log('Testing the secure customer search with same injection string:');
    console.log('Injection string: \'' + "' OR '1'='1" + '\'');
    
    const secureSearchResult = await customerModel.getCustomersSecure("' OR '1'='1");
    console.log(`Result: Found ${secureSearchResult.customers?.length} customers`);
    
    if (secureSearchResult.customers?.length < allCustomers.customers?.length) {
      console.log('SECURITY CONFIRMED: The secure version correctly treated the input as a regular search term!');
      console.log('With parameterized queries, the injection is treated as literal text, not as SQL code.\n');
      
      // Show the secure parameterized query
      console.log('A parameterized query looks like:');
      console.log(`SELECT * FROM customers WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?`);
      console.log('The parameters are passed separately from the SQL code, preventing injection attacks.\n');
    }
    
    connection.release();
    console.log('===============================');
    console.log('SQL INJECTION TESTING COMPLETED');
    console.log('===============================');
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the tests
testSqlInjection()
  .then(() => {
    console.log('All tests completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during testing:', error);
    process.exit(1);
  });