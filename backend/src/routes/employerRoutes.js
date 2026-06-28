const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  getJobMatches,
  getEmployee,
  sendInvite,
  getInvites,
  getApplications,
  updateApplication,
  getCompanyMembers,
  inviteToCompany,
  removeCompanyMember,
} = require('../controllers/employerController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const emp = [protect, requireRole('EMPLOYER')];

router.get('/profile', ...emp, getProfile);
router.put('/profile', ...emp, updateProfile);
router.post('/jobs', ...emp, createJob);
router.get('/jobs', ...emp, getJobs);
router.put('/jobs/:id', ...emp, updateJob);
router.delete('/jobs/:id', ...emp, deleteJob);
router.get('/jobs/:id/matches', ...emp, getJobMatches);
router.get('/employees/:id', ...emp, getEmployee);
router.post('/invites', ...emp, sendInvite);
router.get('/invites', ...emp, getInvites);
router.get('/applications', ...emp, getApplications);
router.put('/applications/:id', ...emp, updateApplication);
router.get('/company/members', ...emp, getCompanyMembers);
router.post('/company/invite', ...emp, inviteToCompany);
router.delete('/company/members/:id', ...emp, removeCompanyMember);

module.exports = router;
