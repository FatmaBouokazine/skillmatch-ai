const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getJobPosts,
  updateJobPost,
  deleteJobPost,
  getApplications,
  updateApplication,
  deleteApplication,
  getInvites,
  updateInvite,
  deleteInvite,
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const admin = [protect, requireRole('ADMIN')];

// User management
router.get('/users', ...admin, getUsers);
router.post('/users', ...admin, createUser);
router.get('/users/:id', ...admin, getUser);
router.put('/users/:id', ...admin, updateUser);
router.delete('/users/:id', ...admin, deleteUser);

// Job post management
router.get('/jobs', ...admin, getJobPosts);
router.put('/jobs/:id', ...admin, updateJobPost);
router.delete('/jobs/:id', ...admin, deleteJobPost);

// Application management
router.get('/applications', ...admin, getApplications);
router.put('/applications/:id', ...admin, updateApplication);
router.delete('/applications/:id', ...admin, deleteApplication);

// Invite management
router.get('/invites', ...admin, getInvites);
router.put('/invites/:id', ...admin, updateInvite);
router.delete('/invites/:id', ...admin, deleteInvite);

module.exports = router;
