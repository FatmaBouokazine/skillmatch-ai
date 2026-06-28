const EmployerProfile = require('../models/EmployerProfile');
const EmployeeProfile = require('../models/EmployeeProfile');
const JobPost = require('../models/JobPost');
const JobInvite = require('../models/JobInvite');
const JobApplication = require('../models/JobApplication');
const CompanyMember = require('../models/CompanyMember');
const User = require('../models/User');
const { computeJobMatchScore } = require('../services/matchingService');

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
    const { firstName, lastName, title, bio, location, companyName, companyLogo, website, description } = req.body;
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (title !== undefined) updates.title = title;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
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

    const job = await JobPost.findOne({ _id: id, employerProfileId: profile._id }).lean();
    if (!job) return res.status(404).json({ message: 'Job post not found' });

    const employees = await EmployeeProfile.find().lean();

    const scored = employees
      .map((emp) => {
        const { score, matchedSkills, breakdown } = computeJobMatchScore(emp, job);
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
          education: emp.education,
          experience: emp.experience,
          matchPercentage: score,
          matchedSkills,
          breakdown,
        };
      })
      .filter((e) => e.matchPercentage >= 50)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

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

// GET /api/employer/applications
exports.getApplications = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const jobs = await JobPost.find({ employerProfileId: profile._id }).select('_id');
    const jobIds = jobs.map((j) => j._id);

    const applications = await JobApplication.find({ jobPostId: { $in: jobIds } })
      .populate({ path: 'jobPostId', select: 'id title type location' })
      .populate({ path: 'employeeProfileId', select: 'id firstName lastName title avatarUrl location resumeScore' })
      .sort({ createdAt: -1 })
      .lean();

    const result = applications.map((app) => ({
      ...app,
      id: app._id.toString(),
      jobPost: app.jobPostId,
      employeeProfile: app.employeeProfileId,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('GetApplications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/employer/applications/:id
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACCEPTED', 'DECLINED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const application = await JobApplication.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Verify the job belongs to this employer
    const job = await JobPost.findOne({ _id: application.jobPostId, employerProfileId: profile._id });
    if (!job) return res.status(403).json({ message: 'Unauthorized' });

    application.status = status;
    await application.save();

    // Auto-add employee to company when accepted
    if (status === 'ACCEPTED') {
      const empProfile = await EmployeeProfile.findById(application.employeeProfileId).select('userId title');
      if (empProfile) {
        const existing = await CompanyMember.findOne({
          employerProfileId: profile._id,
          userId: empProfile.userId,
        });
        if (!existing) {
          await CompanyMember.create({
            employerProfileId: profile._id,
            userId: empProfile.userId,
            role: 'EMPLOYEE',
            jobTitle: empProfile.title || job.title || '',
            status: 'ACTIVE',
            invitedByUserId: req.user._id,
          });
        } else if (existing.status !== 'ACTIVE') {
          existing.status = 'ACTIVE';
          await existing.save();
        }
      }
    }

    res.status(200).json({ id: application._id.toString(), status: application.status });
  } catch (error) {
    console.error('UpdateApplication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employer/company/members
exports.getCompanyMembers = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const members = await CompanyMember.find({ employerProfileId: profile._id })
      .populate({ path: 'userId', select: 'id email role' })
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      members.map(async (m) => {
        let profileData = null;
        if (m.userId?.role === 'EMPLOYEE') {
          profileData = await EmployeeProfile.findOne({ userId: m.userId._id })
            .select('firstName lastName title avatarUrl location').lean();
        } else if (m.userId?.role === 'EMPLOYER') {
          profileData = await EmployerProfile.findOne({ userId: m.userId._id })
            .select('firstName lastName title').lean();
        }
        return {
          id: m._id.toString(),
          userId: m.userId?._id?.toString(),
          email: m.userId?.email,
          userRole: m.userId?.role,
          role: m.role,
          jobTitle: m.jobTitle,
          status: m.status,
          createdAt: m.createdAt,
          profile: profileData,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error) {
    console.error('GetCompanyMembers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/employer/company/invite
exports.inviteToCompany = async (req, res) => {
  try {
    const { email, jobTitle } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const invitedUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!invitedUser) {
      return res.status(404).json({ message: 'No user found with that email address' });
    }

    if (invitedUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot invite yourself' });
    }

    const existing = await CompanyMember.findOne({
      employerProfileId: profile._id,
      userId: invitedUser._id,
    });
    if (existing) {
      return res.status(400).json({
        message: existing.status === 'ACTIVE' ? 'User is already a company member' : 'Invitation already sent to this user',
      });
    }

    const member = await CompanyMember.create({
      employerProfileId: profile._id,
      userId: invitedUser._id,
      role: invitedUser.role === 'EMPLOYER' ? 'EMPLOYER' : 'EMPLOYEE',
      jobTitle: jobTitle || '',
      status: 'PENDING',
      invitedByUserId: req.user._id,
    });

    res.status(201).json({ id: member._id.toString(), email: invitedUser.email, status: member.status });
  } catch (error) {
    console.error('InviteToCompany error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/employer/company/members/:id
exports.removeCompanyMember = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await EmployerProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Employer profile not found' });

    const member = await CompanyMember.findOne({ _id: id, employerProfileId: profile._id });
    if (!member) return res.status(404).json({ message: 'Member not found' });

    await member.deleteOne();
    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('RemoveCompanyMember error:', error);
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