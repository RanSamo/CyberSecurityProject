const express = require('express');
const router = express.Router();
const { customerModel } = require('../models');
const { authenticateUser } = require('../middleware/auth');
const { findUserByEmail } = require('../models/user-model');

// Apply authentication middleware to all routes
router.use(authenticateUser);


// Get all customers for the current user
router.get('/', async (req, res) => {
  try {
    // Check if using authentication or userEmail query parameter
    let userId = req.userId; // From authentication middleware
    const { userEmail } = req.query;
    
    // If userEmail is provided but no userId from auth
    if (userEmail && !userId) {
      // Find the user by email
      const userResult = await userModel.findUserByEmail(userEmail);
      
      if (!userResult.success) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Use the found user's ID
      userId = userResult.user.id;
    }
    
    // Now that we have a userId (either from auth or from email lookup), get all customers
    const result = await customerModel.getAllCustomersForUserSecure(userId);
    
    if (result.success) {
      res.status(200).json({ success: true, customers: result.customers });
    } else {
      res.status(400).json({ success: false, message: result.error || 'Failed to get customers' });
    }
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Search customers
router.get('/search', async (req, res) => {
  try {
    // Get userId from authentication middleware
    const userId = req.userId;
    
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({ success: false, message: 'Search term is required' });
    }
    
    // Pass userId to model function
    const result = await customerModel.getCustomersSecure(term, userId);
    
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
    // Get userId from authentication middleware
    const userId = req.userId;
    
    const { id } = req.params;
    
    // Pass userId to model function to ensure user can only access their own customers
    const result = await customerModel.getCustomerByIdSecure(id, userId);
    
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

// Update customer
router.put('/:id', async (req, res) => {
  try {
    // Get userId from authentication middleware
    const userId = req.userId;
    
    const { id } = req.params;
    
    const customerData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone || '',
      address: req.body.address || '',
      package: req.body.package || 'Basic'
    };
    
    // Pass userId to ensure user can only update their own customers
    const result = await customerModel.updateCustomerSecure(id, customerData, userId);
    
    if (result.success) {
      res.status(200).json({ success: true, message: 'Customer updated successfully' });
    } else {
      res.status(404).json({ success: false, message: result.message || 'Customer not found or update failed' });
    }
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    // Get userId from authentication middleware
    const userId = req.userId;
    
    const { id } = req.params;
    
    // Pass userId to ensure user can only delete their own customers
    const result = await customerModel.deleteCustomerSecure(id, userId);
    
    if (result.success) {
      res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: result.message || 'Customer not found or delete failed' });
    }
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;