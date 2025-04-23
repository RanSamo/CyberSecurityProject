//loading modules - mysql2 with promise support so we can use async/await
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool - reusable pool of connections to the database (keeps the connections open and ready)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
    console.log('Testing database connection...');
    try {
      const connection = await pool.getConnection();
      console.log('✓ Database connection successful!');
      connection.release();
      return true;
    } catch (error) {
      console.error('✗ Error connecting to database:', error.message);
      return false;
    }
  }

module.exports = { pool, testConnection };