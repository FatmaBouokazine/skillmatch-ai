const express = require('express');

const router = express.Router();

const {
  register,
  login,
  getProfile
} = require('../controllers/authController');

const {
  protect
} = require('../middleware/authMiddleware');


// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Protected Route
router.get('/profile', protect, getProfile);

module.exports = router;