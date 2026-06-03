const express = require('express');
const router = express.Router();
const { createJob, getRecruiterJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createJob);
router.get('/recruiter', protect, getRecruiterJobs);

module.exports = router;
