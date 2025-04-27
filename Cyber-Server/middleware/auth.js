//TODO.Implement the authentication with JWT
//This is temp implementation
const authenticateUser = (req, res, next) => {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    // we will verify a token
    // For now, we're just checking if a user ID is provided
    req.userId = userId;
    next();
  };
  
  module.exports = { authenticateUser };