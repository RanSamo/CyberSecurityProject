const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client-controller');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get all clients for the current user
router.get('/', clientController.getAllClients);

// Search clients
router.get('/search', clientController.searchClients);

// Get client by ID
router.get('/:id', clientController.getClientById);

// Update client
router.put('/:id', clientController.updateClient);

// Delete client
router.delete('/:id', clientController.deleteClient);

module.exports = router;