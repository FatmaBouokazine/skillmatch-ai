const EmployerProfile = require('../models/EmployerProfile');
const EmployeeProfile = require('../models/EmployeeProfile');
const JobPost = require('../models/JobPost');
const JobInvite = require('../models/JobInvite');

// GET /api/employer/profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (error) {
    console.error('GetEmployerProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/employer/profile
exports.updateProfile = async (req, res) => {
  try {
    const { companyName, companyLogo, website, description } = req.body;
    const updates = {};
    if (companyName !== undefined) updates.companyName = companyName;
    if (companyLogo !== undefined) updates.companyLogo = companyLogo;
    if (website !== undefined) updates.website = website;
    if (description !== undefined) updates.description = description;

    const profile = await EmployerProfile.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (error) {
    console.error('UpdateEmployerProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/employer/jobs
exports.createJob = async (req, res) => {
  try {
    const { title, description, requiredSkills, location, type } = req.body;
    if (!title || !description || !type) {
      return res.status(400).json({ message: 'Title, description, and type are required' });
    }

    const validTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `Type must be one of: ${validTypes.join(', ')}` });
    }

    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const job = await JobPost.create({
      title,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      location: location || '',
      type,
      employerProfileId: profile._id,
    });
    res.status(201).json(job);
  } catch (error) {
    console.error('CreateJob error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employer/jobs
exports.getJobs = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const jobs = await JobPost.find({ employerProfileId: profile._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('GetJobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/employer/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, location, type, status } = req.body;

    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const job = await JobPost.findOne({ _id: id, employerProfileId: profile._id });
    if (!job) return res.status(404).json({ message: 'Job post not found' });

    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;
    if (requiredSkills !== undefined) job.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : [];
    if (location !== undefined) job.location = location;
    if (type !== undefined) job.type = type;
    if (status !== undefined) job.status = status;

    await job.save();
    res.status(200).json(job);
  } catch (error) {
    console.error('UpdateJob error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/employer/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const job = await JobPost.findOne({ _id: id, employerProfileId: profile._id });
    if (!job) return res.status(404).json({ message: 'Job post not found' });

    await job.deleteOne();
    res.status(200).json({ message: 'Job post deleted successfully' });
  } catch (error) {
    console.error('DeleteJob error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employer/jobs/:id/matches
exports.getJobMatches = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const job = await JobPost.findOne({ _id: id, employerProfileId: profile._id });
    if (!job) return res.status(404).json({ message: 'Job post not found' });

    const requiredSkills = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
    const requiredLower = requiredSkills.map((s) => s.toLowerCase());

    const employees = await EmployeeProfile.find().lean();

    const scored = employees.map((emp) => {
      const empSkills = (emp.skills || []).map((s) => s.name.toLowerCase());
      const matched = requiredLower.filter((s) => empSkills.includes(s));
      const matchPercentage =
        requiredSkills.length > 0
          ? Math.round((matched.length / requiredSkills.length) * 100)
          : 0;
      return {
        id: emp._id.toString(),
        userId: emp.userId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        title: emp.title,
        location: emp.location,
        avatarUrl: emp.avatarUrl,
        resumeScore: emp.resumeScore,
        skills: emp.skills,
        matchPercentage,
        matchedSkills: matched,
      };
    });

    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
    res.status(200).json(scored);
  } catch (error) {
    console.error('GetJobMatches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employer/employees/:id
exports.getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await EmployeeProfile.findById(id);
    if (!profile) return res.status(404).json({ message: 'Employee not found' });
    res.status(200).json(profile);
  } catch (error) {
    console.error('GetEmployee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/employer/invites
exports.sendInvite = async (req, res) => {
  try {
    const { jobPostId, employeeProfileId, message } = req.body;
    if (!jobPostId || !employeeProfileId) {
      return res.status(400).json({ message: 'jobPostId and employeeProfileId are required' });
    }

    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const job = await JobPost.findOne({ _id: jobPostId, employerProfileId: profile._id });
    if (!job) return res.status(404).json({ message: 'Job post not found or unauthorized' });

    const employee = await EmployeeProfile.findById(employeeProfileId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const existing = await JobInvite.findOne({ jobPostId, employeeProfileId });
    if (existing) {
      return res.status(400).json({ message: 'An invite has already been sent to this candidate for this job' });
    }

    const invite = await JobInvite.create({ jobPostId, employeeProfileId, message: message || null });
    res.status(201).json(invite);
  } catch (error) {
    console.error('SendInvite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employer/invites
exports.getInvites = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const jobs = await JobPost.find({ employerProfileId: profile._id }).select('_id');
    const jobIds = jobs.map((j) => j._id);

    const invites = await JobInvite.find({ jobPostId: { $in: jobIds } })
      .populate({ path: 'jobPostId', select: 'id title' })
      .populate({ path: 'employeeProfileId', select: 'id firstName lastName title avatarUrl' })
      .sort({ createdAt: -1 })
      .lean();

    const result = invites.map((inv) => ({
      ...inv,
      id: inv._id.toString(),
      jobPost: inv.jobPostId,
      employeeProfile: inv.employeeProfileId,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('GetInvites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};