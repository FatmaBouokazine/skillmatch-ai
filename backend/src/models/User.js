const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['candidate', 'recruiter', 'admin'],
    default: 'candidate'
  },
  // Candidate specific fields
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  resumeText: { type: String, default: '' },
  resumeScore: { type: Number, default: 0 },
  resumeFeedback: { type: [String], default: [] },
  appliedJobs: [{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    status: { type: String, enum: ['Applied', 'Shortlisted', 'Declined'], default: 'Applied' },
    appliedAt: { type: Date, default: Date.now }
  }],
  // Recruiter specific fields
  companyName: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companyBio: { type: String, default: '' }
});

module.exports = mongoose.model('User', userSchema);