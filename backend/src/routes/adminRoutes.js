const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const admin = [protect, requireRole('ADMIN')];

router.get('/users', ...admin, getUsers);
router.put('/users/:id', ...admin, updateUser);
router.delete('/users/:id', ...admin, deleteUser);

module.exports = router;
