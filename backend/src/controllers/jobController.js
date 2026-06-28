const Job = require('../models/Job');
const User = require('../models/User');

exports.createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, location, salary } = req.body;

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can post jobs' });
    }

    const reqArray = Array.isArray(requirements)
      ? requirements
      : requirements
        ? requirements.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const job = await Job.create({
      title,
      company: company || req.user.companyName || 'Company',
      description,
      requirements: reqArray,
      location: location || 'Remote',
      salary: salary || '',
      recruiter: req.user._id
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecruiterJobs = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    const jobIds = jobs.map(j => j._id);

    let hiredCandidates = 0;
    if (jobIds.length > 0) {
      const applicants = await User.find({ 'appliedJobs.jobId': { $in: jobIds } });
      applicants.forEach((cand) => {
        cand.appliedJobs.forEach((app) => {
          if (
            jobIds.some(id => id.toString() === app.jobId.toString()) &&
            app.status === 'Hired'
          ) {
            hiredCandidates += 1;
          }
        });
      });
    }

    const jobsList = jobs.map(job => ({
      ...job.toObject(),
      applicantsCount: 0
    }));

    res.status(200).json({
      jobs: jobsList,
      stats: {
        postedJobs: jobs.length,
        hiredCandidates
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
