const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema(
  {
    employerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployerProfile',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requiredSkills: { type: [String], default: [] },
    location: { type: String, default: '' },
    type: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE'],
      required: true,
    },
    status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobPost', jobPostSchema);
