const { pool } = require('../config/db');

// Client-related database functions
const clientModel = {
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

  // Get all clients for a specific user 
  async getAllClientsForUser(userId) {
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

  // Get client by ID 
  async getClientById(id, userId) {
    const connection = await pool.getConnection();
    try {
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

  async deleteClient(clientId, userId) {
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