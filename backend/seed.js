/**
 * Force-seed the database.
 * Usage:  node seed.js
 * WARNING: Clears all users, profiles, and job posts before seeding.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User            = require('./src/models/User');
const EmployeeProfile = require('./src/models/EmployeeProfile');
const EmployerProfile = require('./src/models/EmployerProfile');
const JobPost         = require('./src/models/JobPost');

async function run() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) { console.error('Missing MONGO_URI in .env'); process.exit(1); }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Wipe relevant collections
  await Promise.all([
    User.deleteMany({}),
    EmployeeProfile.deleteMany({}),
    EmployerProfile.deleteMany({}),
    JobPost.deleteMany({}),
  ]);
  console.log('Collections cleared');

  const seedDB = require('./src/config/seeder');
  await seedDB();

  await mongoose.disconnect();
  console.log('Done — disconnected.');
}

run().catch(err => { console.error(err); process.exit(1); });
