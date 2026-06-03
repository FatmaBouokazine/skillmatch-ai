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
    enum: ['candidate', 'recruiter'],
    default: 'candidate'
  },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  resumeText: { type: String, default: '' },
  resumeScore: { type: Number, default: 0 },
  topResumeScore: { type: Number, default: 0 },
  lastResumeScore: { type: Number, default: 0 },
  resumeFeedback: { type: [String], default: [] },
  appliedJobs: [{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    status: { type: String, enum: ['Applied', 'Shortlisted', 'Declined', 'Hired'], default: 'Applied' },
    appliedAt: { type: Date, default: Date.now }
  }],
  companyName: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companyBio: { type: String, default: '' }
});

module.exports = mongoose.model('User', userSchema);
