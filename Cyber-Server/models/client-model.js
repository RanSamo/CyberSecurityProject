const { pool } = require('../config/db');

// Client-related database functions
const clientModel = {
  // Create a new client (vulnerable version for XSS demonstration)
  async createClientVulnerable(clientData, userId) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation (SQL injection)
      const query = `INSERT INTO clients (user_id, first_name, last_name, email, phone, address, package) 
                    VALUES (${userId}, '${clientData.firstName}', '${clientData.lastName}', '${clientData.email}', 
                            '${clientData.phone}', '${clientData.address}', '${clientData.package}')`;
      
      const [result] = await connection.query(query);
      
      return { success: true, clientId: result.insertId };
    } catch (error) {
      console.error('Error creating client:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },
  
  // Create a new client (secure version)
  async createClientSecure(clientData, userId) {
    const connection = await pool.getConnection();
    try {
      // Secure version - parameterized query
      const [result] = await connection.query(
        'INSERT INTO clients (user_id, first_name, last_name, email, phone, address, package) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          clientData.firstName,
          clientData.lastName,
          clientData.email,
          clientData.phone,
          clientData.address,
          clientData.package
        ]
      );
      
      return { success: true, clientId: result.insertId };
    } catch (error) {
      console.error('Error creating client:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },
  
  // Get clients by search term (vulnerable version for SQL injection demonstration)
  async getClientsVulnerable(searchTerm, userId) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation
      const query = `SELECT * FROM clients WHERE user_id = ${userId} AND (first_name LIKE '%${searchTerm}%' OR last_name LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%')`;
      
      const [clients] = await connection.query(query);
      
      return { success: true, clients };
    } catch (error) {
      console.error('Error getting clients:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },
  
  // Get clients by search term (secure version)
  async getClientsSecure(searchTerm, userId) {
    const connection = await pool.getConnection();
    try {
      // Secure version - parameterized query
      const [clients] = await connection.query(
        'SELECT * FROM clients WHERE user_id = ? AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)',
        [userId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      
      return { success: true, clients };
    } catch (error) {
      console.error('Error getting clients:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Get all clients for a specific user (secure version)
  async getAllClientsForUserSecure(userId) {
    const connection = await pool.getConnection();
    try {
      const [clients] = await connection.query(
        'SELECT * FROM clients WHERE user_id = ?',
        [userId]
      );
      
      return { success: true, clients };
    } catch (error) {
      console.error('Error getting all clients for user:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Get all clients for a specific user (vulnerable version)
  async getAllClientsForUserVulnerable(userId) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation
      const query = `SELECT * FROM clients WHERE user_id = ${userId}`;
      
      const [clients] = await connection.query(query);
      
      return { success: true, clients };
    } catch (error) {
      console.error('Error getting all clients for user:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Get client by ID (secure version) 
  async getClientByIdSecure(id, userId) {
    const connection = await pool.getConnection();
    try {
      // Secure version - parameterized query for exact ID match with user validation
      const [clients] = await connection.query(
        'SELECT * FROM clients WHERE client_id = ? AND user_id = ?', 
        [id, userId]
      );
      
      if (clients.length === 0) {
        return { success: false, message: 'Client not found' };
      }
      
      return { success: true, client: clients[0] };
    } catch (error) {
      console.error('Error getting client by ID:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Get client by ID (vulnerable version for SQL injection demonstration)
  async getClientByIdVulnerable(id, userId) {
    const connection = await pool.getConnection();
    try {
      // Vulnerable version - direct string concatenation
      const query = `SELECT * FROM clients WHERE client_id = ${id} AND user_id = ${userId}`;
      
      const [clients] = await connection.query(query);
      
      if (clients.length === 0) {
        return { success: false, message: 'Client not found' };
      }
      
      return { success: true, client: clients[0] };
    } catch (error) {
      console.error('Error getting client by ID:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Update client (secure version)
  async updateClientSecure(clientId, clientData, userId) {
    const connection = await pool.getConnection();
    try {
      // First check if the client belongs to this user
      const [clients] = await connection.query(
        'SELECT * FROM clients WHERE client_id = ? AND user_id = ?',
        [clientId, userId]
      );
      
      if (clients.length === 0) {
        return { success: false, message: 'Client not found or access denied' };
      }
      
      // Update the client
      await connection.query(
        'UPDATE clients SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, package = ? WHERE client_id = ?',
        [
          clientData.firstName,
          clientData.lastName,
          clientData.email,
          clientData.phone,
          clientData.address,
          clientData.package,
          clientId
        ]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating client:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  },

  // Delete client (secure version)
  async deleteClientSecure(clientId, userId) {
    const connection = await pool.getConnection();
    try {
      // First check if the client belongs to this user
      const [clients] = await connection.query(
        'SELECT * FROM clients WHERE client_id = ? AND user_id = ?',
        [clientId, userId]
      );
      
      if (clients.length === 0) {
        return { success: false, message: 'Client not found or access denied' };
      }
      
      // Delete the client
      await connection.query(
        'DELETE FROM clients WHERE client_id = ?',
        [clientId]
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting client:', error);
      return { success: false, error: error.message };
    } finally {
      connection.release();
    }
  }
};

module.exports = clientModel;