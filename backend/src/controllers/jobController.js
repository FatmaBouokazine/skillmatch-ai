const Job = require('../models/Job');
const User = require('../models/User');

// Calculate match score between candidate skills and job requirements
const calculateMatchScore = (candidateSkills, jobRequirements) => {
  if (!jobRequirements || jobRequirements.length === 0) {
    return { score: 100, matched: [], missing: [] };
  }
  if (!candidateSkills || candidateSkills.length === 0) {
    return { score: 0, matched: [], missing: jobRequirements };
  }

  const normalizedCandidate = candidateSkills.map(s => s.trim().toLowerCase());
  const matched = [];
  const missing = [];

  jobRequirements.forEach(req => {
    const normReq = req.trim().toLowerCase();
    const isFound = normalizedCandidate.some(cand => cand.includes(normReq) || normReq.includes(cand));
    if (isFound) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const score = Math.round((matched.length / jobRequirements.length) * 100);
  return { score, matched, missing };
};

// Create a Job Post (Recruiter Only)
exports.createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, location, salary } = req.body;

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Only recruiters can post jobs' });
    }

    // Split requirements if it's a string, or format to array
    const reqArray = Array.isArray(requirements)
      ? requirements
      : requirements
        ? requirements.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const job = await Job.create({
      title,
      company,
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

// Get All Jobs (with match scores if user is candidate)
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('recruiter', 'name email');
    
    // If the request contains a user session and user is candidate, calculate scores
    if (req.user && req.user.role === 'candidate') {
      const candidateSkills = req.user.skills || [];
      const jobsWithScores = jobs.map(job => {
        const matchInfo = calculateMatchScore(candidateSkills, job.requirements);
        const application = req.user.appliedJobs.find(app => app.jobId.toString() === job._id.toString());
        
        return {
          ...job.toObject(),
          matchScore: matchInfo.score,
          matchedSkills: matchInfo.matched,
          missingSkills: matchInfo.missing,
          applicationStatus: application ? application.status : null
        };
      });
      return res.status(200).json(jobsWithScores);
    }

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Jobs posted by the recruiter
exports.getRecruiterJobs = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jobs = await Job.find({ recruiter: req.user._id });
    
    // For each job, find the applicants count
    const jobsWithApplicantCount = await Promise.all(jobs.map(async (job) => {
      const applicantsCount = await User.countDocuments({ 'appliedJobs.jobId': job._id });
      return {
        ...job.toObject(),
        applicantsCount
      };
    }));

    res.status(200).json(jobsWithApplicantCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply to a Job (Candidate Only)
exports.applyJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can apply to jobs' });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = req.user.appliedJobs.some(app => app.jobId.toString() === id);
    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    // Push to candidate's applied list
    req.user.appliedJobs.push({ jobId: id, status: 'Applied' });
    await req.user.save();

    res.status(200).json({ message: 'Applied successfully', status: 'Applied' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applicants for a specific job (Recruiter Only)
exports.getJobApplicants = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find users who have applied to this jobId
    const applicants = await User.find({ 'appliedJobs.jobId': id }).select('-password');
    
    // Map candidates to extract status, match score, etc.
    const candidates = applicants.map(cand => {
      const app = cand.appliedJobs.find(a => a.jobId.toString() === id);
      const matchInfo = calculateMatchScore(cand.skills || [], job.requirements);
      
      return {
        _id: cand._id,
        name: cand.name,
        email: cand.email,
        bio: cand.bio,
        skills: cand.skills,
        resumeScore: cand.resumeScore,
        matchScore: matchInfo.score,
        matchedSkills: matchInfo.matched,
        missingSkills: matchInfo.missing,
        status: app ? app.status : 'Applied',
        appliedAt: app ? app.appliedAt : null
      };
    });

    // Rank by matchScore descending
    candidates.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Candidate Application Status (Recruiter Only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { jobId, candidateId, status } = req.body;

    if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!['Applied', 'Shortlisted', 'Declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to manage this job' });
    }

    // Find the candidate and update the status of their application
    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const application = candidate.appliedJobs.find(app => app.jobId.toString() === jobId);
    if (!application) {
      return res.status(404).json({ message: 'Application record not found' });
    }

    application.status = status;
    await candidate.save();

    res.status(200).json({ message: 'Status updated successfully', candidateId, status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
