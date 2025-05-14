const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const userRoutes = require('./routes/user-routes');
const systemRoutes = require('./routes/system-routes');
const clientRoutes = require('./routes/client-routes')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection on startup
testConnection();

// Routes
app.use('/users', userRoutes);
app.use('/clients', clientRoutes);
app.use('/system', systemRoutes); 


// Basic route for testing
app.get('/', (req, res) => {
  res.send('Communication_LTD API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes