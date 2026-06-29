const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const EmployerProfile = require('../models/EmployerProfile');
const JobPost = require('../models/JobPost');
const JobApplication = require('../models/JobApplication');
const JobInvite = require('../models/JobInvite');

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && ['EMPLOYEE', 'EMPLOYER', 'ADMIN'].includes(role.toUpperCase())) {
      filter.role = role.toUpperCase();
    }

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).lean();

    const results = await Promise.all(
      users.map(async (u) => {
        let employeeProfile = null;
        let employerProfile = null;
        if (u.role === 'EMPLOYEE') {
          employeeProfile = await EmployeeProfile.findOne({ userId: u._id })
            .select('-__v')
            .lean();
        } else if (u.role === 'EMPLOYER') {
          employerProfile = await EmployerProfile.findOne({ userId: u._id })
            .select('-__v')
            .lean();
        }
        return { ...u, id: u._id.toString(), employeeProfile, employerProfile };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users/:id
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    let employeeProfile = null;
    let employerProfile = null;
    if (user.role === 'EMPLOYEE') {
      employeeProfile = await EmployeeProfile.findOne({ userId: id }).select('-__v').lean();
    } else if (user.role === 'EMPLOYER') {
      employerProfile = await EmployerProfile.findOne({ userId: id }).select('-__v').lean();
    }

    res.status(200).json({ ...user, id: user._id.toString(), employeeProfile, employerProfile });
  } catch (error) {
    console.error('GetUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, profile } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Email update
    if (email && email.trim()) {
      const emailLower = email.toLowerCase().trim();
      const conflict = await User.findOne({ email: emailLower, _id: { $ne: id } });
      if (conflict) return res.status(400).json({ message: 'Email already in use by another account' });
      user.email = emailLower;
    }

    // Password update
    if (password && password.trim()) {
      user.passwordHash = await bcrypt.hash(password.trim(), 12);
    }

    // Role update (cannot change own role)
    if (role && ['EMPLOYEE', 'EMPLOYER', 'ADMIN'].includes(role.toUpperCase())) {
      if (id === req.user.id.toString()) {
        return res.status(400).json({ message: 'Cannot modify your own role' });
      }
      user.role = role.toUpperCase();
    }

    await user.save();

    // Profile fields update
    if (profile && typeof profile === 'object') {
      const allowedEmployeeFields = ['firstName', 'lastName', 'title', 'bio', 'location', 'phone', 'linkedIn', 'github'];
      const allowedEmployerFields = ['firstName', 'lastName', 'title', 'bio', 'location', 'companyName', 'website', 'description'];

      if (user.role === 'EMPLOYEE') {
        const update = {};
        allowedEmployeeFields.forEach((f) => { if (f in profile) update[f] = profile[f]; });
        await EmployeeProfile.findOneAndUpdate({ userId: id }, update, { new: true, upsert: true });
      } else if (user.role === 'EMPLOYER') {
        const update = {};
        allowedEmployerFields.forEach((f) => { if (f in profile) update[f] = profile[f]; });
        await EmployerProfile.findOneAndUpdate({ userId: id }, update, { new: true, upsert: true });
      }
    }

    // Return updated user with profile
    const updated = await User.findById(id).select('-passwordHash').lean();
    let employeeProfile = null;
    let employerProfile = null;
    if (updated.role === 'EMPLOYEE') {
      employeeProfile = await EmployeeProfile.findOne({ userId: id }).select('-__v').lean();
    } else if (updated.role === 'EMPLOYER') {
      employerProfile = await EmployerProfile.findOne({ userId: id }).select('-__v').lean();
    }

    res.status(200).json({ ...updated, id: updated._id.toString(), employeeProfile, employerProfile });
  } catch (error) {
    console.error('UpdateUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    const normalizedRole = role.toUpperCase();
    if (!['EMPLOYEE', 'EMPLOYER', 'ADMIN'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Role must be EMPLOYEE, EMPLOYER, or ADMIN' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email: email.toLowerCase(), passwordHash, role: normalizedRole });

    if (normalizedRole === 'EMPLOYEE') {
      await EmployeeProfile.create({ userId: user._id });
    } else if (normalizedRole === 'EMPLOYER') {
      await EmployerProfile.create({ userId: user._id });
    }

    res.status(201).json({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (error) {
    console.error('CreateUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Job Post Management ─────────────────────────────────────────────────────

// GET /api/admin/jobs
exports.getJobPosts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['OPEN', 'CLOSED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    const jobs = await JobPost.find(filter).sort({ createdAt: -1 }).lean();

    const results = await Promise.all(
      jobs.map(async (job) => {
        const employer = await EmployerProfile.findById(job.employerProfileId)
          .select('companyName firstName lastName')
          .lean();
        return { ...job, id: job._id.toString(), employer };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error('GetJobPosts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/jobs/:id
exports.updateJobPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredSkills, location, type, status } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (requiredSkills !== undefined) updates.requiredSkills = requiredSkills;
    if (location !== undefined) updates.location = location;
    if (type !== undefined) {
      if (!['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE'].includes(type.toUpperCase())) {
        return res.status(400).json({ message: 'Invalid job type' });
      }
      updates.type = type.toUpperCase();
    }
    if (status !== undefined) {
      if (!['OPEN', 'CLOSED'].includes(status.toUpperCase())) {
        return res.status(400).json({ message: 'Status must be OPEN or CLOSED' });
      }
      updates.status = status.toUpperCase();
    }

    const job = await JobPost.findByIdAndUpdate(id, updates, { new: true });
    if (!job) return res.status(404).json({ message: 'Job post not found' });

    res.status(200).json(job);
  } catch (error) {
    console.error('UpdateJobPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/jobs/:id
exports.deleteJobPost = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await JobPost.findByIdAndDelete(id);
    if (!job) return res.status(404).json({ message: 'Job post not found' });

    res.status(200).json({ message: 'Job post deleted successfully' });
  } catch (error) {
    console.error('DeleteJobPost error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Application Management ──────────────────────────────────────────────────

// GET /api/admin/applications
exports.getApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['PENDING', 'ACCEPTED', 'DECLINED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    const applications = await JobApplication.find(filter)
      .populate({ path: 'jobPostId', select: 'title status' })
      .populate({ path: 'employeeProfileId', select: 'firstName lastName' })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(applications.map(a => ({ ...a, id: a._id.toString() })));
  } catch (error) {
    console.error('GetApplications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/applications/:id
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'ACCEPTED', 'DECLINED'].includes(status.toUpperCase())) {
      return res.status(400).json({ message: 'Status must be PENDING, ACCEPTED, or DECLINED' });
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { status: status.toUpperCase() },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });

    res.status(200).json(application);
  } catch (error) {
    console.error('UpdateApplication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/applications/:id
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findByIdAndDelete(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('DeleteApplication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Invite Management ───────────────────────────────────────────────────────

// GET /api/admin/invites
exports.getInvites = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['PENDING', 'ACCEPTED', 'DECLINED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    const invites = await JobInvite.find(filter)
      .populate({ path: 'jobPostId', select: 'title status' })
      .populate({ path: 'employeeProfileId', select: 'firstName lastName' })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(invites.map(i => ({ ...i, id: i._id.toString() })));
  } catch (error) {
    console.error('GetInvites error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/admin/invites/:id
exports.updateInvite = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['PENDING', 'ACCEPTED', 'DECLINED'].includes(status.toUpperCase())) {
      return res.status(400).json({ message: 'Status must be PENDING, ACCEPTED, or DECLINED' });
    }

    const invite = await JobInvite.findByIdAndUpdate(
      id,
      { status: status.toUpperCase() },
      { new: true }
    );
    if (!invite) return res.status(404).json({ message: 'Invite not found' });

    res.status(200).json(invite);
  } catch (error) {
    console.error('UpdateInvite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/admin/invites/:id
exports.deleteInvite = async (req, res) => {
  try {
    const { id } = req.params;

    const invite = await JobInvite.findByIdAndDelete(id);
    if (!invite) return res.status(404).json({ message: 'Invite not found' });

    res.status(200).json({ message: 'Invite deleted successfully' });
  } catch (error) {
    console.error('DeleteInvite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
