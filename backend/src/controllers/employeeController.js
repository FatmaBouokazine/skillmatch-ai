const path = require('path');
const EmployeeProfile = require('../models/EmployeeProfile');
const JobPost = require('../models/JobPost');
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
      };
    });

    scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
    res.status(200).json(scored);
  } catch (error) {
    console.error('GetJobMatches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

