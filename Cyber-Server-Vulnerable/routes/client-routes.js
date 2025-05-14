const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client-controller');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Get all clients for the current user
router.get('/', clientController.getAllClients);

// Delete client
router.delete('/:id', clientController.deleteClient);


module.exports = router;