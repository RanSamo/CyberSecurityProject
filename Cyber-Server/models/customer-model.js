const { pool } = require('../config/db');

// Customer-related database functions
const customerModel = {
  // Create a new customer (vulnerable version for XSS demonstration)
  async createCustomerVulnerable(customerData) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation (SQL injection)
      const query = `INSERT INTO customers (first_name, last_name, email, phone, address, package) 
                    VALUES ('${customerData.firstName}', '${customerData.lastName}', '${customerData.email}', 
                            '${customerData.phone}', '${customerData.address}', '${customerData.package}')`;
      
      const [result] = await connection.query(query);
      
      return { success: true, customerId: result.insertId };
    } catch (error) {
      console.error('Error creating customer:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },
  
  // Create a new customer (secure version)
  async createCustomerSecure(customerData) {
    const connection = await pool.getConnection();
    try {
      // Secure version - parameterized query
      const [result] = await connection.query(
        'INSERT INTO customers (first_name, last_name, email, phone, address, package) VALUES (?, ?, ?, ?, ?, ?)',
        [
          customerData.firstName,
          customerData.lastName,
          customerData.email,
          customerData.phone,
          customerData.address,
          customerData.package
        ]
      );
      
      return { success: true, customerId: result.insertId };
    } catch (error) {
      console.error('Error creating customer:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },
  
  // Get customer by search term (vulnerable version for SQL injection demonstration)
  async getCustomersVulnerable(searchTerm) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation
      const query = `SELECT * FROM customers WHERE first_name LIKE '%${searchTerm}%' OR last_name LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`;
      
      const [customers] = await connection.query(query);
      
      return { success: true, customers };
    } catch (error) {
      console.error('Error getting customers:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },
  
  // Get customer by search term (secure version)
  async getCustomersSecure(searchTerm) {
    const connection = await pool.getConnection();
    try {
      // Secure version - parameterized query
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?',
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      
      return { success: true, customers };
    } catch (error) {
      console.error('Error getting customers:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  //Get customer by ID (secure version) 
async getCustomerByIdSecure(id) {
  const connection = await pool.getConnection();
  try {
    // Secure version - parameterized query for exact ID match
    const [customers] = await connection.query(
      'SELECT * FROM customers WHERE customer_id = ?', 
      [id]
    );
    
    if (customers.length === 0) {
      return { success: false, message: 'Customer not found' };
    }
    
    return { success: true, customer: customers[0] };
  } catch (error) {
    console.error('Error getting customer by ID:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
},

  // Get customer by ID (vulnerable version for SQL injection demonstration)
  async getCustomerByIdVulnerable(id) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation
      const query = `SELECT * FROM customers WHERE customer_id = ${id}`;
      
      const [customers] = await connection.query(query);
      
      if (customers.length === 0) {
        return { success: false, message: 'Customer not found' };
      }
      
      return { success: true, customer: customers[0] };
    } catch (error) {
      console.error('Error getting customer by ID:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }
};

module.exports = customerModel;