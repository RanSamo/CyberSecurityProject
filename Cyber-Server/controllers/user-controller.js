const jwt = require('jsonwebtoken');
const { userModel } = require('../models');

const userController = {
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      const userResult = await userModel.findUserByEmail(email);
      if (!userResult.success) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const result = await userModel.verifyUserSecure(email, password);
      if (result.success) {
        // ✅ JWT payload and signing
        const token = jwt.sign(
          {
            userId: result.userId,
            email: result.email
          },
          process.env.JWT_SECRET,
          { expiresIn: '3h' }
        );

        res.status(200).json({
          success: true,
          token,
          userId: result.userId,
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName
        });
      } else {
        res.status(401).json({ success: false, message: result.message || 'Invalid credentials' });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error during login' });
    }
  }
};

module.exports = userController;
