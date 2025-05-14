const { clientModel } = require('../models');

// system controller functions
const systemController = {
  // Create a new client
  async createClient(req, res) {
    try {
      // Get userId from authentication middleware
      const userId = req.userId;
      
      const clientData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.cEmail || `${req.body.firstName.toLowerCase()}.${req.body.lastName.toLowerCase()}@example.com`,
        phone: req.body.phoneNumber || '',
        address: req.body.address || '',
        package: req.body.packageLevel || 'Basic'
      };
      
      // Pass userId to model function
      const result = await clientModel.createClientVulnerable(clientData, userId);
      
      if (result.success) {
        res.status(201).json({ success: true, clientId: result.clientId });
      } else {
        res.status(400).json({ success: false, message: result.error || 'Failed to create client' });
      }
    } catch (error) {
      console.error('Client creation error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = systemController;