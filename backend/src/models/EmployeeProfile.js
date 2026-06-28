const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
});

const experienceSchema = new mongoose.Schema({
  company:     { type: String, default: '' },
  role:        { type: String, default: '' },
  startDate:   { type: String, default: '' },
  endDate:     { type: String, default: '' },
  current:     { type: Boolean, default: false },
  description: { type: String, default: '' },
});

const educationSchema = new mongoose.Schema({
  institution: { type: String, default: '' },
  degree:      { type: String, default: '' },
  field:       { type: String, default: '' },
  startDate:   { type: String, default: '' },
  endDate:     { type: String, default: '' },
});

const employeeProfileSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName:   { type: String, default: '' },
    lastName:    { type: String, default: '' },
    title:       { type: String, default: '' },
    bio:         { type: String, default: '' },
    location:    { type: String, default: '' },
    phone:       { type: String, default: '' },
    linkedIn:    { type: String, default: '' },
    github:      { type: String, default: '' },
    avatarUrl:   { type: String, default: '' },
    resumeUrl:   { type: String, default: '' },
    resumeScore: { type: Number, default: 0 },
    resumeHints: { type: [String], default: [] },
    skills:      { type: [skillSchema], default: [] },
    experience:  { type: [experienceSchema], default: [] },
    education:   { type: [educationSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);
