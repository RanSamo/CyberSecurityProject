const { pool } = require('../config/db');

// Customer-related database functions
const customerModel = {
  // Create a new customer (vulnerable version for XSS demonstration)
  async createCustomerVulnerable(customerData, userId) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation (SQL injection)
      const query = `INSERT INTO customers (user_id, first_name, last_name, email, phone, address, package) 
                    VALUES (${userId}, '${customerData.firstName}', '${customerData.lastName}', '${customerData.email}', 
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
  async createCustomerSecure(customerData, userId) {
    const connection = await pool.getConnection();
    try {
      // Secure version - parameterized query
      const [result] = await connection.query(
        'INSERT INTO customers (user_id, first_name, last_name, email, phone, address, package) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
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
  
  // Get customers by search term (vulnerable version for SQL injection demonstration)
  async getCustomersVulnerable(searchTerm, userId) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation
      const query = `SELECT * FROM customers WHERE user_id = ${userId} AND (first_name LIKE '%${searchTerm}%' OR last_name LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%')`;
      
      const [customers] = await connection.query(query);
      
      return { success: true, customers };
    } catch (error) {
      console.error('Error getting customers:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },
  
  // Get customers by search term (secure version)
  async getCustomersSecure(searchTerm, userId) {
    const connection = await pool.getConnection();
    try {
      // Secure version - parameterized query
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE user_id = ? AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)',
        [userId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      
      return { success: true, customers };
    } catch (error) {
      console.error('Error getting customers:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Get all customers for a specific user (secure version)
  async getAllCustomersForUserSecure(userId) {
    const connection = await pool.getConnection();
    try {
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE user_id = ?',
        [userId]
      );
      
      return { success: true, customers };
    } catch (error) {
      console.error('Error getting all customers for user:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Get all customers for a specific user (vulnerable version)
  async getAllCustomersForUserVulnerable(userId) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation
      const query = `SELECT * FROM customers WHERE user_id = ${userId}`;
      
      const [customers] = await connection.query(query);
      
      return { success: true, customers };
    } catch (error) {
      console.error('Error getting all customers for user:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Get customer by ID (secure version) 
  async getCustomerByIdSecure(id, userId) {
    const connection = await pool.getConnection();
    try {
      // Secure version - parameterized query for exact ID match with user validation
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE customer_id = ? AND user_id = ?', 
        [id, userId]
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
  async getCustomerByIdVulnerable(id, userId) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation
      const query = `SELECT * FROM customers WHERE customer_id = ${id} AND user_id = ${userId}`;
      
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
  },

  // Update customer (secure version)
  async updateCustomerSecure(customerId, customerData, userId) {
    const connection = await pool.getConnection();
    try {
      // First check if the customer belongs to this user
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE customer_id = ? AND user_id = ?',
        [customerId, userId]
      );
      
      if (customers.length === 0) {
        return { success: false, message: 'Customer not found or access denied' };
      }
      
      // Update the customer
      await connection.query(
        'UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, package = ? WHERE customer_id = ?',
        [
          customerData.firstName,
          customerData.lastName,
          customerData.email,
          customerData.phone,
          customerData.address,
          customerData.package,
          customerId
        ]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Delete customer (secure version)
  async deleteCustomerSecure(customerId, userId) {
    const connection = await pool.getConnection();
    try {
      // First check if the customer belongs to this user
      const [customers] = await connection.query(
        'SELECT * FROM customers WHERE customer_id = ? AND user_id = ?',
        [customerId, userId]
      );
      
      if (customers.length === 0) {
        return { success: false, message: 'Customer not found or access denied' };
      }
      
      // Delete the customer
      await connection.query(
        'DELETE FROM customers WHERE customer_id = ?',
        [customerId]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }
};

module.exports = customerModel;