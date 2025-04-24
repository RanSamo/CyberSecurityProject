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
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(256) NOT NULL,
        salt VARCHAR(64) NOT NULL,
        failed_login_attempts INT DEFAULT 0,
        account_locked BOOLEAN DEFAULT FALSE,
        password_reset_token VARCHAR(64),
        password_reset_token_expiry DATETIME
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
    
    // Create customers table with user_id foreign key
    // unique_email_per_user - ensures that a single user cannot have multiple customers with the same email
    // but different users can have customers with the same email
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        customer_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(255),  
        package VARCHAR(255) DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        UNIQUE KEY unique_email_per_user (email, user_id) 
      )
    `);
    console.log('Customers table created successfully');
   
    // Create indexes for better performance
    try {
      await connection.query(`CREATE INDEX idx_users_email ON users(email)`);
      await connection.query(`CREATE INDEX idx_customers_user_id ON customers(user_id)`);
      console.log('Indexes created successfully');
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