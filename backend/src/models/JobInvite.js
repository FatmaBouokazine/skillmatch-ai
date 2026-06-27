const mongoose = require('mongoose');

const jobInviteSchema = new mongoose.Schema(
  {
    jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPost', required: true },
    employeeProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeProfile',
      required: true,
    },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED'], default: 'PENDING' },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobInvite', jobInviteSchema);
