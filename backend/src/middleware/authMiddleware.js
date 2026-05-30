const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {

  let token;

  // Vérifier header authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {

    try {

      // Récupérer token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Récupérer user
      req.user = await User.findById(decoded.id).select('-password');

      next();

    } catch (error) {
      return res.status(401).json({
        message: 'Not authorized'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: 'No token'
    });
  }
};

module.exports = { protect };