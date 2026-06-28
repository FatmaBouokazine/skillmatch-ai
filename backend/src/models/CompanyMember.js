const mongoose = require('mongoose');

const companyMemberSchema = new mongoose.Schema(
  {
    employerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployerProfile',
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 'EMPLOYEE' = hired/invited employee, 'EMPLOYER' = colleague in same company
    role: { type: String, enum: ['EMPLOYEE', 'EMPLOYER'], required: true },
    jobTitle: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'ACTIVE'], default: 'PENDING' },
    invitedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// One membership per user per company
companyMemberSchema.index({ employerProfileId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CompanyMember', companyMemberSchema);
