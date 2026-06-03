const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getRecruiterJobs,
  applyJob,
  getJobApplicants,
  updateApplicationStatus
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Get all jobs (candidates see match scores)
router.get('/', protect, getJobs);

// Create a job post (recruiter only)
router.post('/', protect, createJob);

// Get recruiter's job postings
router.get('/recruiter', protect, getRecruiterJobs);

// Apply to a job (candidate only)
router.post('/:id/apply', protect, applyJob);

// Get applicants for a job (recruiter only)
router.get('/:id/applicants', protect, getJobApplicants);

// Update applicant status (recruiter only)
router.put('/status', protect, updateApplicationStatus);

module.exports = router;
