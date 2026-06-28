const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema(
  {
    jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', required: true },
    employeeProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeProfile',
      required: true,
    },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED'], default: 'PENDING' },
    coverLetter: { type: String, default: '' },
  },
  { timestamps: true }
);

// One application per employee per job
jobApplicationSchema.index({ jobPostId: 1, employeeProfileId: 1 }, { unique: true });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
