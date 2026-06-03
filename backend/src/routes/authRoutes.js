const express = require('express');

const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/authController');

const {
  protect
} = require('../middleware/authMiddleware');


// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Protected Route (Get Profile)
router.get('/profile', protect, getProfile);

// Update Profile
router.put('/profile', protect, updateProfile);

// Admin Routes
router.get('/users', protect, getAllUsers);
router.put('/users/:id', protect, updateUserRole);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;