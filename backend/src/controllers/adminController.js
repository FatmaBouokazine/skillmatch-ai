const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const EmployerProfile = require('../models/EmployerProfile');

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
            .select('firstName lastName resumeScore')
            .lean();
        } else if (u.role === 'EMPLOYER') {
          employerProfile = await EmployerProfile.findOne({ userId: u._id })
            .select('companyName')
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

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['EMPLOYEE', 'EMPLOYER', 'ADMIN'].includes(role.toUpperCase())) {
      return res
        .status(400)
        .json({ message: 'Valid role is required: EMPLOYEE, EMPLOYER, or ADMIN' });
    }

    if (id === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own role' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: role.toUpperCase() },
      { new: true }
    ).select('id email role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
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
