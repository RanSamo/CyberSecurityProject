const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system-controller');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Create a new client
router.post('/', systemController.createClient);

module.exports = router;