const mysql = require('mysql');
const { pool } = require('../config/db');

// Client-related database functions
const clientModel = {
async createClientVulnerable(clientData, userId) {
  return new Promise((resolve, reject) => {
    // Create a connection using the original mysql package
    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true // Enable multiple statements for more advanced injections
    });
    
    // Construct the vulnerable query with string concatenation
    const query = "INSERT INTO clients (user_id, first_name, last_name, email, phone, address, package) " +
                 "VALUES (" + userId + ", '" + clientData.firstName + "', '" + clientData.lastName + "', '" +
                 clientData.email + "', '" + clientData.phone + "', '" + clientData.address + "', '" +
                 clientData.package + "')";
    
    console.log("VULNERABLE QUERY:", query);
    
    // Execute the query directly
    connection.query(query, (error, results) => {
      connection.end(); // Always close the connection
      
      if (error) {
        console.error('Error creating client:', error);
        reject({ success: false, error: error.message });
      } else {
        resolve({ success: true, clientId: results.insertId });
      }
    });
    });
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

  // Get client by ID (secure version) 
  async getClientById(id, userId) {
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

  // Delete client (secure version)
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



