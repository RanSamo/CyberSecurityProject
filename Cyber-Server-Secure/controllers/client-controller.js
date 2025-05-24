const { clientModel } = require('../models');
const inputValidator = require('../utils/input-validator');

// Client controller functions
const clientController = {
  // Get all clients for the current user
  async getAllClients(req, res) {
    try {
      // Get userId from JWT token (added by auth middleware)
      const userId = req.userId;
      
      console.log('Fetching clients for userId:', userId);
      
      // Get all clients (raw data from database)
      const result = await clientModel.getAllClientsForUser(userId);
      
      console.log('Client fetch result:', result);
      
      if (result.success) {
        // HTML encode ALL text fields for consistent security
        const encodedClients = result.clients.map(client => ({
          ...client,
          first_name: inputValidator.htmlEncode(client.first_name),
          last_name: inputValidator.htmlEncode(client.last_name),
          email: inputValidator.htmlEncode(client.email),
          phone: inputValidator.htmlEncode(client.phone), 
          address: inputValidator.htmlEncode(client.address),
          package: inputValidator.htmlEncode(client.package)
          // Encode ALL fields for consistent security approach
        }));
        
        console.log('✅ All client fields encoded for web output');
        res.status(200).json({ success: true, clients: encodedClients });
      } else {
        res.status(400).json({ success: false, message: result.error || 'Failed to get clients' });
      }
    } catch (error) {
      console.error('Get all clients error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Delete client
  async deleteClient(req, res) {
    try {
      // Get userId from authentication middleware
      const userId = req.userId;
      
      const { id } = req.params;
      
      // Pass userId to ensure user can only delete their own clients
      const result = await clientModel.deleteClient(id, userId);
      
      if (result.success) {
        res.status(200).json({ success: true, message: 'Client deleted successfully' });
      } else {
        res.status(404).json({ success: false, message: result.message || 'Client not found or delete failed' });
      }
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = clientController;