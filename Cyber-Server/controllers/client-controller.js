const { clientModel } = require('../models');
const { findUserByEmail } = require('../models/user-model');

// Client controller functions
const clientController = {
  // Get all clients for the current user
  // Get all clients for the current user
async getAllClients(req, res) {
  try {
    // Get userId from JWT token (added by auth middleware)
    const userId = req.userId;
    
    console.log('Fetching clients for userId:', userId);
    
    // Now that we have a userId from auth, get all clients
    const result = await clientModel.getAllClientsForUserSecure(userId);
    
    console.log('Client fetch result:', result);
    
    if (result.success) {
      res.status(200).json({ success: true, clients: result.clients });
    } else {
      res.status(400).json({ success: false, message: result.error || 'Failed to get clients' });
    }
  } catch (error) {
    console.error('Get all clients error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
},

  // Search clients
  async searchClients(req, res) {
    try {
      // Get userId from authentication middleware
      const userId = req.userId;
      
      const { term } = req.query;
      
      if (!term) {
        return res.status(400).json({ success: false, message: 'Search term is required' });
      }
      
      // Pass userId to model function
      const result = await clientModel.getClientsSecure(term, userId);
      
      if (result.success) {
        res.status(200).json({ success: true, clients: result.clients });
      } else {
        res.status(400).json({ success: false, message: result.error || 'Search failed' });
      }
    } catch (error) {
      console.error('Client search error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Get client by ID
  async getClientById(req, res) {
    try {
      // Get userId from authentication middleware
      const userId = req.userId;
      
      const { id } = req.params;
      
      // Pass userId to model function to ensure user can only access their own clients
      const result = await clientModel.getClientByIdSecure(id, userId);
      
      if (result.success) {
        res.status(200).json({ success: true, client: result.client });
      } else {
        res.status(404).json({ success: false, message: 'Client not found' });
      }
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Update client
  async updateClient(req, res) {
    try {
      // Get userId from authentication middleware
      const userId = req.userId;
      
      const { id } = req.params;
      
      const clientData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone || '',
        address: req.body.address || '',
        package: req.body.package || 'Basic'
      };
      
      // Pass userId to ensure user can only update their own clients
      const result = await clientModel.updateClientSecure(id, clientData, userId);
      
      if (result.success) {
        res.status(200).json({ success: true, message: 'Client updated successfully' });
      } else {
        res.status(404).json({ success: false, message: result.message || 'Client not found or update failed' });
      }
    } catch (error) {
      console.error('Update client error:', error);
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
      const result = await clientModel.deleteClientSecure(id, userId);
      
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