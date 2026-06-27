const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, default: '' },
    companyLogo: { type: String, default: '' },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);
