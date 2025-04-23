const express = require('express');
const router = express.Router();
const { customerModel } = require('../models');

// Add new customer
router.post('/', async (req, res) => {
  try {
    const customerData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email || `${req.body.firstName.toLowerCase()}.${req.body.lastName.toLowerCase()}@example.com`,
      phone: req.body.phone || '',
      address: req.body.address || '',
      package: req.body.package || 'Basic'
    };
    
    // Using the secure version 
    const result = await customerModel.createCustomerSecure(customerData);
    
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

// Search customers
router.get('/search', async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ success: false, message: 'Search term is required' });
    }
    
    // Using the secure version 
    const result = await customerModel.getCustomersSecure(term);
    
    if (result.success) {
      res.status(200).json({ success: true, customers: result.customers });
    } else {
      res.status(400).json({ success: false, message: result.error || 'Search failed' });
    }
  } catch (error) {
    console.error('Customer search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await customerModel.getCustomerByIdSecure(id);
    
    if (result.success) {
      res.status(200).json({ success: true, customer: result.customer });
    } else {
      res.status(404).json({ success: false, message: 'Customer not found' });
    }
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;