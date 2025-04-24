// test-sql-injection.js - Script to demonstrate SQL injection vulnerabilities
const customerModel = require('../models/customer-model');
const userModel = require('../models/user-model');
const { pool } = require('../config/db');

// Helper function to display results
function displayResults(title, data) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
  console.log("=============================================");
}

async function runTests() {
  console.log('======================================================');
  console.log('SQL INJECTION & XSS VULNERABILITY DEMONSTRATION');
  console.log('======================================================');
  
  try {
    /**
     * PART 1: SQL INJECTION IN USER REGISTRATION (Section 1 in Part A)
     * Demonstrating SQL injection in the registration process
     */
    console.log('\n\n======= PART 1: SQL INJECTION IN USER REGISTRATION =======');
    
    // Using a valid password that meets all requirements to bypass validation
    const securePassword = "BasketB123!";
    
    // 1. Normal registration with secure function
    console.log('\n1.1. Normal user registration with secure function:');
    console.log('Using: userModel.createUserSecure("normal@example.com", "BasketB123!")');
    
    const normalSecureResult = await userModel.createUserSecure(
      "normal@example.com", 
      securePassword
    );
    console.log('Result:', normalSecureResult);
    
    // 2. Normal registration with vulnerable function
    console.log('\n1.2. Normal user registration with vulnerable function:');
    console.log('Using: userModel.createUserVulnerable("normal2@example.com", "BasketB123!")');
    
    const normalVulnerableResult = await userModel.createUserVulnerable(
      "normal2@example.com", 
      securePassword
    );
    console.log('Result:', normalVulnerableResult);
    
    // 3. SQL Injection attempt with vulnerable function
    console.log('\n1.3. SQL Injection in user registration:');
    
    // SQL Injection in email field - attempts to insert values directly
    const maliciousEmail = "evil@example.com', 'injectedhash', 'injectedsalt'); -- ";
    
    console.log(`Using SQL injection in email field: "${maliciousEmail}"`);
    console.log(`Resulting query will be: INSERT INTO users (email, password_hash, salt) VALUES ('${maliciousEmail}', '...', '...')`);
    console.log('Which becomes: INSERT INTO users (email, password_hash, salt) VALUES (\'evil@example.com\', \'injectedhash\', \'injectedsalt\'); -- \', \'...\', \'...\')');
    
    try {
      const injectionResult = await userModel.createUserVulnerable(
        maliciousEmail, 
        securePassword
      );
      console.log('Result:', injectionResult);
    } catch (error) {
      console.log('Error occurred (expected):', error.message);
    }
    
    // 4. Show that the same injection fails with secure function
    console.log('\n1.4. Same SQL Injection attempt with secure function:');
    console.log(`Using: userModel.createUserSecure("${maliciousEmail}", "BasketB123!")`);
    
    try {
      const secureInjectionResult = await userModel.createUserSecure(
        maliciousEmail, 
        securePassword
      );
      console.log('Result:', secureInjectionResult);
    } catch (error) {
      console.log('Error occurred:', error.message);
    }
    
    /**
     * PART 2: SQL INJECTION IN USER LOGIN (Section 3 in Part A)
     * Demonstrating SQL injection in the login process
     */
    console.log('\n\n======= PART 2: SQL INJECTION IN USER LOGIN =======');
    
    // 1. Normal login with secure function
    console.log('\n2.1. Normal login with secure function:');
    console.log('Using: userModel.verifyUserSecure("normal@example.com", "BasketB123!")');
    
    const normalLoginSecure = await userModel.verifyUserSecure(
      "normal@example.com",
      securePassword
    );
    console.log('Result:', normalLoginSecure);
    
    // 2. Normal login with vulnerable function
    console.log('\n2.2. Normal login with vulnerable function:');
    console.log('Using: userModel.verifyUserVulnerable("normal@example.com", "BasketB123!")');
    
    const normalLoginVulnerable = await userModel.verifyUserVulnerable(
      "normal@example.com",
      securePassword
    );
    console.log('Result:', normalLoginVulnerable);
    
    // 3. SQL Injection in login with vulnerable function
    console.log('\n2.3. SQL Injection to bypass login:');
    
    // Try to target a specific user with SQL injection
    const bypassEmail = "' OR email = 'normal@example.com' -- ";
    const wrongPassword = "wrong_password";
    
    console.log(`Using SQL injection in email field: "${bypassEmail}"`);
    console.log(`Resulting query will be: SELECT * FROM users WHERE email = '${bypassEmail}'`);
    console.log("Which becomes: SELECT * FROM users WHERE email = '' OR email='normal@example.com' -- '");
    
    const injectionLoginResult = await userModel.verifyUserVulnerable(
      bypassEmail,
      wrongPassword
    );
    console.log('Result:', injectionLoginResult);
    
    // 4. Show that the same injection fails with secure function
    console.log('\n2.4. Same SQL Injection attempt with secure function:');
    console.log(`Using: userModel.verifyUserSecure("${bypassEmail}", "wrong_password")`);
    
    const secureLoginResult = await userModel.verifyUserSecure(
      bypassEmail,
      wrongPassword
    );
    console.log('Result:', secureLoginResult);
    
    /**
     * PART 3: SQL INJECTION IN CUSTOMER SEARCH (Section 4 in Part A)
     * Demonstrating SQL injection in the customer search functionality
     */
    console.log('\n\n======= PART 3: SQL INJECTION IN CUSTOMER SEARCH =======');
    
    // First, make sure we have some customers to search
    // Check if we have customers
    const connection = await pool.getConnection();
    const [customers] = await connection.query('SELECT COUNT(*) as count FROM customers');
    connection.release();
    
    if (customers[0].count === 0) {
      console.log('\nAdding sample customers for testing...');
      
      // Add some test customers if none exist
      await customerModel.createCustomerSecure({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        address: '123 Main St',
        package: 'Fiber 100Mbps'
      });
      
      await customerModel.createCustomerSecure({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-987-6543',
        address: '456 Elm St',
        package: 'Premium 500Mbps'
      });
    }
    
    // 1. Normal search with secure function
    console.log('\n3.1. Normal customer search with secure function:');
    console.log('Using: customerModel.getCustomersSecure("John")');
    
    const secureSearch = await customerModel.getCustomersSecure("John");
    displayResults('Normal search results for "John"', secureSearch);
    
    // 2. Normal search with vulnerable function
    console.log('\n3.2. Normal customer search with vulnerable function:');
    console.log('Using: customerModel.getCustomersVulnerable("John")');
    
    const vulnerableSearch = await customerModel.getCustomersVulnerable("John");
    displayResults('Normal search results for "John"', vulnerableSearch);
    
    // 3. SQL Injection to retrieve all customers
    console.log('\n3.3. SQL Injection to retrieve all customers:');
    
    const allCustomersInjection = "' OR '1'='1";
    
    console.log(`Using SQL injection: "${allCustomersInjection}"`);
    console.log(`Resulting query will be: SELECT * FROM customers WHERE first_name LIKE '%${allCustomersInjection}%' OR ...`);
    console.log("Which becomes: SELECT * FROM customers WHERE first_name LIKE '%' OR '1'='1%' OR ...");
    
    const allCustomersResult = await customerModel.getCustomersVulnerable(allCustomersInjection);
    displayResults('Results with SQL injection', allCustomersResult);
    
    // 4. Show that the same injection fails with secure function
    console.log('\n3.4. Same SQL Injection attempt with secure function:');
    console.log(`Using: customerModel.getCustomersSecure("${allCustomersInjection}")`);
    
    const secureSearchInjection = await customerModel.getCustomersSecure(allCustomersInjection);
    displayResults('Results with secure function', secureSearchInjection);
    
    // 5. SQL Injection UNION attack to extract user data
    console.log('\n3.5. SQL Injection UNION attack to extract user data:');
    
    const unionInjection = "' UNION SELECT user_id, email, password_hash, salt, 'N/A', 'N/A', 'N/A' FROM users -- ";
    
    console.log(`Using UNION injection: "${unionInjection}"`);
    console.log('This combines customer results with user table data, exposing sensitive information');
    
    const unionResult = await customerModel.getCustomersVulnerable(unionInjection);
    displayResults('Results with UNION attack', unionResult);
    
    /**
     * PART 4: STORED XSS IN CUSTOMER CREATION (Section 4 in Part A)
     * Demonstrating stored XSS vulnerability
     */
    console.log('\n\n======= PART 4: STORED XSS IN CUSTOMER CREATION =======');
    
    // 1. Normal customer creation with secure function
    console.log('\n4.1. Normal customer creation with secure function:');
    
    const normalCustomer = {
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@example.com',
      phone: '555-111-2222',
      address: '789 Oak St',
      package: 'Basic 50Mbps'
    };
    
    console.log('Using customerModel.createCustomerSecure with normal data');
    const secureCustomerResult = await customerModel.createCustomerSecure(normalCustomer);
    console.log('Result:', secureCustomerResult);
    
    // 2. Customer creation with XSS payload using vulnerable function
    console.log('\n4.2. Customer creation with XSS payload:');
    
    const xssCustomer = {
      firstName: '<script>alert("XSS Attack!");</script>',
      lastName: 'Hacker',
      email: 'xss.attack@example.com',
      phone: '555-666-7777',
      address: '123 Hack St',
      package: 'Malicious Package'
    };
    
    console.log('Using customerModel.createCustomerVulnerable with XSS payload in firstName');
    console.log('XSS Payload: <script>alert("XSS Attack!");</script>');
    
    const xssCustomerResult = await customerModel.createCustomerVulnerable(xssCustomer);
    console.log('Result:', xssCustomerResult);
    
    // 3. Verify XSS payload was stored
    if (xssCustomerResult.success && xssCustomerResult.customerId) {
      console.log('\n4.3. Verifying the XSS payload was stored:');
      
      const xssCustomerVerify = await customerModel.getCustomerByIdVulnerable(xssCustomerResult.customerId);
      displayResults('Customer with XSS payload', xssCustomerVerify);
      
      console.log('\nXSS Attack Explanation:');
      console.log('1. The script tag was stored directly in the database');
      console.log('2. When this customer data is displayed in an HTML page, the script will execute');
      console.log('3. This could be used to steal cookies, redirect users, or perform unwanted actions');
    }
    
    // 4. Same XSS payload with secure function (shows encoding)
    console.log('\n4.4. Same XSS payload with secure function:');
    
    console.log('Using customerModel.createCustomerSecure with the same XSS payload');
    const secureXssResult = await customerModel.createCustomerSecure(xssCustomer);
    console.log('Result:', secureXssResult);
    
    if (secureXssResult.success && secureXssResult.customerId) {
      const secureXssVerify = await customerModel.getCustomerByIdSecure(secureXssResult.customerId);
      displayResults('Customer with XSS payload using secure function', secureXssVerify);
      
      console.log('\nNote: The secure function should either:');
      console.log('1. Encode special characters when storing data, or');
      console.log('2. Encode special characters when rendering data to HTML');
    }
    
    /**
     * SUMMARY: PROTECTION METHODS
     */
    console.log('\n\n======= PROTECTION METHODS SUMMARY =======');
    
    console.log('\n1. Protection against SQL Injection:');
    console.log('✅ Use parameterized queries instead of string concatenation:');
    console.log(`
// Vulnerable (string concatenation):
const query = \`SELECT * FROM users WHERE email = '${bypassEmail}'\`;

// Secure (parameterized query):
const [users] = await connection.query(
  'SELECT * FROM users WHERE email = ?', 
  [email]
);`);
    
    console.log('\n2. Protection against Stored XSS:');
    console.log('✅ Encode special characters before storing or displaying:');
    console.log(`
// Encoding function example:
function encodeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Use when displaying customer data:
document.getElementById('customerName').innerHTML = encodeHTML(customer.firstName);`);
    
  } catch (error) {
    console.error('\nAn error occurred during testing:', error);
  } finally {
    // Close the connection pool
    await pool.end();
    console.log('\n======================================================');
    console.log('DEMONSTRATION COMPLETED');
    console.log('======================================================');
  }
}

// Run the tests
runTests();