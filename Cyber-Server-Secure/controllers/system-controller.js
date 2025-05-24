const { clientModel } = require('../models');
const inputValidator = require('../utils/input-validator');

// system controller functions
const systemController = {
  // Create a new client (secure version with validation and encoding)
  async createClient(req, res) {
    try {
      // Get userId from authentication middleware
      const userId = req.userId;
      
      console.log('📥 Incoming client data (SECURE VERSION):', req.body);
      
      // Validate and sanitize all input data
      const validationResult = inputValidator.validateClientData(req.body);
      
      if (!validationResult.isValid) {
        console.log('❌ Validation failed:', validationResult.errors);
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid input data', 
          errors: validationResult.errors 
        });
      }
      
      console.log('✅ Data validation passed');
      console.log('🛡️ Sanitized data:', validationResult.sanitizedData);
      
      // Use the sanitized data - matching your existing structure
      const clientData = {
        firstName: validationResult.sanitizedData.firstName,
        lastName: validationResult.sanitizedData.lastName,
        email: validationResult.sanitizedData.email,
        phone: validationResult.sanitizedData.phone,
        address: validationResult.sanitizedData.address,
        package: validationResult.sanitizedData.package
      };
      
      // Pass userId to model function - using your existing secure method
      const result = await clientModel.createClientSecure(clientData, userId);
      
      if (result.success) {
        console.log('✅ Client created successfully with sanitized data');
        res.status(201).json({ success: true, clientId: result.clientId });
      } else {
        console.log('❌ Failed to create client:', result.error);
        res.status(400).json({ success: false, message: result.error || 'Failed to create client' });
      }
    } catch (error) {
      console.error('❌ Client creation error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = systemController;