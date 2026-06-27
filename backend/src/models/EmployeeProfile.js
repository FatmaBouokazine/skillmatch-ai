const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
});

const employeeProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    resumeScore: { type: Number, default: 0 },
    resumeHints: { type: [String], default: [] },
    skills: { type: [skillSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);
