const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const EmployerProfile = require('../models/EmployerProfile');

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    const normalizedRole = role.toUpperCase();
    if (!['EMPLOYEE', 'EMPLOYER'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Role must be EMPLOYEE or EMPLOYER' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, role: normalizedRole });

    if (normalizedRole === 'EMPLOYEE') {
      await EmployeeProfile.create({ userId: user._id });
    } else {
      await EmployerProfile.create({ userId: user._id });
    }

    const token = generateToken(user.id, user.role);
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);
    res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    let employeeProfile = null;
    let employerProfile = null;

    if (user.role === 'EMPLOYEE') {
      employeeProfile = await EmployeeProfile.findOne({ userId: user._id });
    } else if (user.role === 'EMPLOYER') {
      employerProfile = await EmployerProfile.findOne({ userId: user._id });
    }

    res.status(200).json({ ...user.toObject(), id: user.id, employeeProfile, employerProfile });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





