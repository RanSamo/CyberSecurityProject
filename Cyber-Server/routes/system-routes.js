const express = require('express');
const router = express.Router();
const { customerModel } = require('../models');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Add new customer
router.post('/', async (req, res) => {
  try {
    // Get userId from authentication middleware
    const userId = req.userId;
    
    const customerData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.cEmail || `${req.body.firstName.toLowerCase()}.${req.body.lastName.toLowerCase()}@example.com`,
      phone: req.body.phoneNumber || '',
      address: req.body.address || '',
      package: req.body.packageLevel || 'Basic'
    };
    
    // Pass userId to model function
    const result = await customerModel.createCustomerSecure(customerData, userId);
    
    if (result.success) {
      res.status(201).json({ success: true, customerId: result.customerId });
    } else {
      res.status(400).json({ success: false, message: result.error || 'Failed to create customer' });
    }
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;