const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadResume,
  getResumeScore,
  extractResume,
  addSkill,
  removeSkill,
  getJobMatches,
  getAIJobMatches,
  getJobById,
  applyForJob,
  getMyApplications,
  getCompanyInvites,
  respondToCompanyInvite,
} = require('../controllers/employeeController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

const emp = [protect, requireRole('EMPLOYEE')];

router.get('/profile', ...emp, getProfile);
router.put('/profile', ...emp, updateProfile);
router.post('/resume', ...emp, upload.single('resume'), uploadResume);
router.get('/resume/score', ...emp, getResumeScore);
router.post('/resume/extract', ...emp, extractResume);
router.post('/skills', ...emp, addSkill);
router.delete('/skills/:id', ...emp, removeSkill);
router.get('/jobs/matches', ...emp, getJobMatches);
router.get('/jobs/ai-matches', ...emp, getAIJobMatches);
router.get('/jobs/:id', ...emp, getJobById);
router.post('/jobs/:id/apply', ...emp, applyForJob);
router.get('/applications', ...emp, getMyApplications);
router.get('/company/invites', ...emp, getCompanyInvites);
router.put('/company/invites/:id', ...emp, respondToCompanyInvite);

module.exports = router;
