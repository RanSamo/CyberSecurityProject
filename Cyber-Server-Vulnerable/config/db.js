const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Config object for clarity
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

// Create a connection pool with the config
const pool = mysql.createPool(dbConfig);

// Log the configuration
console.log("DB Connection multipleStatements setting:", dbConfig.multipleStatements);

// Test database connection
async function testConnection() {
    console.log('Testing database connection...');
    try {
      const connection = await pool.getConnection();
      
      // Test if multiple statements actually work
      const [results] = await connection.query('SELECT 1 as test; SELECT 2 as test2;');
      console.log('Multiple statements test:', results);
      
      console.log('✓ Database connection successful!');
      connection.release();
      return true;
    } catch (error) {
      console.error('✗ Error connecting to database:', error.message);
      return false;
    }
  }

module.exports = { pool, testConnection };