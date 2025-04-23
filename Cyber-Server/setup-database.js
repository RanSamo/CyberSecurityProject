const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  // First connect without selecting a specific database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Select the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(256) NOT NULL,
        salt VARCHAR(64) NOT NULL,
        failed_login_attempts INT DEFAULT 0,
        account_locked BOOLEAN DEFAULT FALSE,
        password_reset_token VARCHAR(64),
        password_reset_token_expiry DATETIME,
        is_admin BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Users table created successfully');
    
    // Create password history table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS password_history (
        history_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        password_hash VARCHAR(256) NOT NULL,
        salt VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);
    console.log('Password history table created successfully');
    
    // Create customers table (simplified without sector_id)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        address VARCHAR(255),  
        package VARCHAR(255) DEFAULT NULL
      )
    `);
    console.log('Customers table created successfully');
   
    // Create indexes for better performance
    try {
      await connection.query(`CREATE INDEX idx_users_email ON users(email)`);
      console.log('Index created successfully');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('Index already exists, skipping creation');
      } else {
        console.error('Error creating index:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();