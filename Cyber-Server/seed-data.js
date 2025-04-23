const { pool } = require('./db');
const crypto = require('crypto');

function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password, salt) {
  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(password);
  return hmac.digest('hex');
}

async function seedData() {
  console.log('Seeding database with test data...');
  
  const connection = await pool.getConnection();
  try {
    // Insert admin user with secure password
    console.log('Adding admin user...');
    const adminSalt = generateSalt();
    const adminPassword = 'Admin@123456'; // This meets the password requirements
    const adminPasswordHash = hashPassword(adminPassword, adminSalt);
    
    await connection.query(`
      INSERT INTO users (username, email, password_hash, salt, is_admin) 
      VALUES (?, ?, ?, ?, TRUE)
    `, ['admin', 'admin@comunication.ltd', adminPasswordHash, adminSalt]);
    
    // Get the user ID of the admin
    const [adminResult] = await connection.query(
      'SELECT user_id FROM users WHERE username = ?',
      ['admin']
    );
    const adminId = adminResult[0].user_id;
    
    // Add admin password to history
    await connection.query(`
      INSERT INTO password_history (user_id, password_hash, salt) VALUES
      (?, ?, ?)
    `, [adminId, adminPasswordHash, adminSalt]);
    
    // Insert a regular user
    console.log('Adding regular user...');
    const userSalt = generateSalt();
    const userPassword = 'Test@123456'; // This meets the password requirements
    const userPasswordHash = hashPassword(userPassword, userSalt);
    
    await connection.query(`
      INSERT INTO users (username, email, password_hash, salt, is_admin) 
      VALUES (?, ?, ?, ?, FALSE)
    `, ['user', 'user@example.com', userPasswordHash, userSalt]);
    
    // Get the user ID
    const [userResult] = await connection.query(
      'SELECT user_id FROM users WHERE username = ?',
      ['user']
    );
    const userId = userResult[0].user_id;
    
    // Add user password to history
    await connection.query(`
      INSERT INTO password_history (user_id, password_hash, salt) VALUES
      (?, ?, ?)
    `, [userId, userPasswordHash, userSalt]);
    
    // Insert some test customers
    console.log('Adding test customers...');
    await connection.query(`
      INSERT INTO customers (first_name, last_name, email, phone, address, package) VALUES
      ('John', 'Doe', 'john.doe@example.com', '555-123-4567', '123 Main St', 'Fiber 100Mbps'),
      ('Jane', 'Smith', 'jane.smith@example.com', '555-987-6543', '456 Elm St', 'Premium 500Mbps'),
      ('Bob', 'Johnson', 'bob.johnson@example.com', '555-555-5555', '789 Oak Ave', 'Basic 50Mbps')
    `);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    connection.release();
  }
}

// Run the seeding function
seedData()
  .then(() => {
    console.log('All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });