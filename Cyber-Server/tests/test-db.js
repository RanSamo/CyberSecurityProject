//loads db.js and export testconnection function
const { testConnection } = require('../config/db.js');

const path = require('path');

// Make sure environment variables are loaded in the test file too
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testDatabase() {
  console.log('Starting database test...');
  
  try {
    // Test connection
    console.log('Attempting to connect to database...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Could not connect to database. Please check your credentials and make sure MySQL is running.');
    } else {
      console.log('Successfully connected to database!');
    }
  } catch (error) {
    console.error('Error during database test:', error);
  }
}

console.log('Test script initialized');
testDatabase();
console.log('Test script execution complete - check results above');