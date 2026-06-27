const path = require('path');
const EmployeeProfile = require('../models/EmployeeProfile');
const JobPost = require('../models/JobPost');
const JobApplication = require('../models/JobApplication');
const CompanyMember = require('../models/CompanyMember');
const JobInvite = require('../models/JobInvite');
const EmployerProfile = require('../models/EmployerProfile');
const { parsePDF, scoreResume, extractResumeData } = require('../services/resumeService');

// GET /api/employee/profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (error) {
    console.error('GetEmployeeProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/employee/profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, title, bio, location, avatarUrl } = req.body;
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (title !== undefined) updates.title = title;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    const profile = await EmployeeProfile.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json(profile);
  } catch (error) {
    console.error('UpdateEmployeeProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/employee/resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please attach a PDF file.' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const text = await parsePDF(req.file.path);
    const { score, hints } = scoreResume(text);

    await EmployeeProfile.findOneAndUpdate(
      { userId: req.user._id },
      { resumeUrl, resumeScore: score, resumeHints: hints }
    );

    res.status(200).json({
      message: 'Resume uploaded and scored successfully',
      resumeUrl,
      resumeScore: score,
      resumeHints: hints,
    });
  } catch (error) {
    console.error('UploadResume error:', error);
    res.status(500).json({ message: 'Server error during resume upload' });
  }
};

// GET /api/employee/resume/score
exports.getResumeScore = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id })
      .select('resumeScore resumeHints resumeUrl');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.status(200).json({
      resumeScore: profile.resumeScore,
      resumeHints: profile.resumeHints,
      resumeUrl: profile.resumeUrl,
    });
  } catch (error) {
    console.error('GetResumeScore error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/employee/resume/extract
exports.extractResume = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id }).select('resumeUrl');
    if (!profile || !profile.resumeUrl) {
      return res.status(400).json({ message: 'Please upload a resume first before extracting.' });
    }

    const filePath = path.join(__dirname, '../../', profile.resumeUrl);
    const text = await parsePDF(filePath);
    const extracted = await extractResumeData(text);

    res.status(200).json({ extracted });
  } catch (error) {
    console.error('ExtractResume error:', error);
    if (error.message && error.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ message: 'AI extraction service is not configured.' });
    }
    res.status(500).json({ message: 'Failed to extract resume data.' });
  }
};

// POST /api/employee/skills
exports.addSkill = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const duplicate = profile.skills.find(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    profile.skills.push({ name: name.trim() });
    await profile.save();

    const newSkill = profile.skills[profile.skills.length - 1];
    res.status(201).json(newSkill);
  } catch (error) {
    console.error('AddSkill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/employee/skills/:id
exports.removeSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const skill = profile.skills.id(id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    skill.deleteOne();
    await profile.save();

    res.status(200).json({ message: 'Skill removed' });
  } catch (error) {
    console.error('RemoveSkill error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employee/jobs/matches
exports.getJobMatches = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const empSkillsLower = profile.skills.map((s) => s.name.toLowerCase());

    const jobs = await JobPost.find({ status: 'OPEN' })
      .populate({ path: 'employerProfileId', select: 'companyName companyLogo' })
      .lean();

    // Get all jobs this employee has applied to
    const applied = await JobApplication.find({ employeeProfileId: profile._id }).select('jobPostId').lean();
    const appliedIds = new Set(applied.map((a) => a.jobPostId.toString()));

    const scored = jobs.map((job) => {
      const required = Array.isArray(job.requiredSkills) ? job.requiredSkills : [];
      const matched = required.filter((s) => empSkillsLower.includes(s.toLowerCase()));
      const matchPercentage =
        required.length > 0 ? Math.round((matched.length / required.length) * 100) : 0;
      return {
        ...job,
        id: job._id.toString(),
        employerProfile: job.employerProfileId,
        matchPercentage,
        matchedSkills: matched,
        hasApplied: appliedIds.has(job._id.toString()),
      };
    });

    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
    res.status(200).json(scored);
  } catch (error) {
    console.error('GetJobMatches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/employee/jobs/:id/apply
exports.applyForJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { coverLetter } = req.body;

    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const job = await JobPost.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'OPEN') {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    const existing = await JobApplication.findOne({ jobPostId: id, employeeProfileId: profile._id });
    if (existing) return res.status(400).json({ message: 'You have already applied for this job' });

    const application = await JobApplication.create({
      jobPostId: id,
      employeeProfileId: profile._id,
      coverLetter: coverLetter || '',
    });

    res.status(201).json({ id: application._id.toString(), status: application.status });
  } catch (error) {
    console.error('ApplyForJob error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employee/applications
exports.getMyApplications = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const applications = await JobApplication.find({ employeeProfileId: profile._id })
      .populate({
        path: 'jobPostId',
        select: 'id title type location status',
        populate: { path: 'employerProfileId', select: 'companyName' },
      })
      .sort({ createdAt: -1 })
      .lean();

    const result = applications.map((app) => ({
      id: app._id.toString(),
      status: app.status,
      coverLetter: app.coverLetter,
      createdAt: app.createdAt,
      jobPost: app.jobPostId,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('GetMyApplications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employee/company/invites
exports.getCompanyInvites = async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });

    // 1. Job invites — employer directly invited this candidate to consider a job
    let jobResults = [];
    if (profile) {
      const jobInvites = await JobInvite.find({ employeeProfileId: profile._id })
        .populate({
          path: 'jobPostId',
          select: 'title location type',
          populate: { path: 'employerProfileId', select: 'companyName' },
        })
        .sort({ createdAt: -1 })
        .lean();

      jobResults = jobInvites.map((inv) => ({
        id: inv._id.toString(),
        type: 'JOB',
        status: inv.status,
        message: inv.message || '',
        jobTitle: inv.jobPostId?.title || '',
        jobLocation: inv.jobPostId?.location || '',
        employerProfile: inv.jobPostId?.employerProfileId || null,
        createdAt: inv.createdAt,
      }));
    }

    // 2. Company membership invites — employer invited this user to join their company
    const memberInvites = await CompanyMember.find({ userId: req.user._id })
      .populate({ path: 'employerProfileId', select: 'companyName website' })
      .sort({ createdAt: -1 })
      .lean();

    const memberResults = memberInvites.map((inv) => ({
      id: inv._id.toString(),
      type: 'COMPANY',
      status: inv.status === 'ACTIVE' ? 'ACCEPTED' : 'PENDING',
      message: '',
      jobTitle: inv.jobTitle || '',
      employerProfile: inv.employerProfileId || null,
      createdAt: inv.createdAt,
    }));

    // Merge and sort newest first
    const all = [...jobResults, ...memberResults].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json(all);
  } catch (error) {
    console.error('GetCompanyInvites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/employee/company/invites/:id
exports.respondToCompanyInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept } = req.body;

    // Try CompanyMember invite first
    const member = await CompanyMember.findOne({ _id: id, userId: req.user._id });
    if (member) {
      if (accept) {
        member.status = 'ACTIVE';
        await member.save();
        return res.status(200).json({ message: 'Joined company successfully' });
      } else {
        await member.deleteOne();
        return res.status(200).json({ message: 'Invitation declined' });
      }
    }

    // Try JobInvite
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (profile) {
      const invite = await JobInvite.findOne({ _id: id, employeeProfileId: profile._id })
        .populate({ path: 'jobPostId', select: 'employerProfileId title' });
      if (invite) {
        invite.status = accept ? 'ACCEPTED' : 'DECLINED';
        await invite.save();

        // On accept: automatically add employee to the recruiter's company as ACTIVE member
        if (accept && invite.jobPostId?.employerProfileId) {
          const employerProfileId = invite.jobPostId.employerProfileId;
          const existing = await CompanyMember.findOne({
            employerProfileId,
            userId: req.user._id,
          });
          if (!existing) {
            await CompanyMember.create({
              employerProfileId,
              userId: req.user._id,
              role: 'EMPLOYEE',
              jobTitle: invite.jobPostId.title || '',
              status: 'ACTIVE',
            });
          } else if (existing.status !== 'ACTIVE') {
            existing.status = 'ACTIVE';
            await existing.save();
          }
        }

        return res.status(200).json({ message: accept ? 'Invite accepted' : 'Invite declined' });
      }
    }

    return res.status(404).json({ message: 'Invite not found' });
  } catch (error) {
    console.error('RespondToCompanyInvite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

