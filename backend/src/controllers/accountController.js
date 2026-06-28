const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');

exports.getAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('id email role createdAt');
    res.status(200).json(user);
  } catch (error) {
    console.error('GetAccount error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, avatarUrl } = req.body;
    const updates = {};

    if (email && email.toLowerCase() !== req.user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
      updates.email = email.toLowerCase();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: 'Current password is required to set a new password' });
      }
      const dbUser = await User.findById(req.user.id);
      const isMatch = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0 && !avatarUrl) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    let user = req.user;
    if (Object.keys(updates).length > 0) {
      user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select(
        'id email role'
      );
    }

    if (avatarUrl && req.user.role === 'EMPLOYEE') {
      await EmployeeProfile.findOneAndUpdate({ userId: req.user._id }, { avatarUrl });
    }

    res.status(200).json({ message: 'Account updated successfully', user });
  } catch (error) {
    console.error('UpdateAccount error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};