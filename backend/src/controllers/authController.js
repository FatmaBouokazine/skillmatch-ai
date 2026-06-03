const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};


// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Vérifier si user existe
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {

    const { email, password } = req.body;

    // Vérifier user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid password'
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


// PROFILE (Protected)
exports.getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// UPDATE PROFILE (Protected)
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, bio, skills, companyName, companyWebsite, companyBio } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (companyName !== undefined) user.companyName = companyName;
    if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;
    if (companyBio !== undefined) user.companyBio = companyBio;

    // Simulate resume scoring if candidate updates skills or bio
    if (user.role === 'candidate' && (skills || bio)) {
      // Simple dynamic scoring based on details filled out
      let score = 30;
      const feedback = [];
      
      if (user.bio && user.bio.length > 20) {
        score += 20;
      } else {
        feedback.push('Add a professional bio description detailing your goals.');
      }
      
      if (user.skills && user.skills.length > 0) {
        score += Math.min(user.skills.length * 10, 40);
        if (user.skills.length < 4) {
          feedback.push('Add at least 4 key technical skill tags to improve matching visibility.');
        }
      } else {
        feedback.push('Add technical skills (e.g. React, Node, Python) to match with recruiter requirements.');
      }

      if (user.bio.includes('experience') || user.bio.includes('developer') || user.bio.includes('engineer')) {
        score += 10;
      } else {
        feedback.push('Describe your professional experience or title in your bio.');
      }

      user.resumeScore = score;
      user.resumeFeedback = feedback;
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER ROLE (Admin Only)
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { role } = req.body;
    if (!['candidate', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: 'User role updated successfully', user: { _id: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully', userId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};