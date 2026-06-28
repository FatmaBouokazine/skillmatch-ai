const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');

const seedDB = async () => {
  try {
    // Check if database already has users
    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      console.log('Database already has users. Seeding skipped.');
      return;
    }

    console.log('Seeding database with mock data...');

    // Clear existing data (if any)
    await Job.deleteMany({});

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Recruiters
    const recruiterTesla = await User.create({
      name: 'Elon Recruiter',
      email: 'recruiter@tesla.com',
      password: hashedPassword,
      role: 'recruiter',
      companyName: 'Tesla, Inc.',
      companyWebsite: 'https://tesla.com',
      companyBio: 'Accelerating the world\'s transition to sustainable energy through clean energy and electric vehicles.'
    });

    const recruiterGoogle = await User.create({
      name: 'Sundar Recruiter',
      email: 'recruiter@google.com',
      password: hashedPassword,
      role: 'recruiter',
      companyName: 'Google LLC',
      companyWebsite: 'https://google.com',
      companyBio: 'Organizing the world\'s information and making it universally accessible and useful.'
    });

    // Create Candidates
    const candidateFrontend = await User.create({
      name: 'Fatma Candidate',
      email: 'candidate@skillmatch.ai',
      password: hashedPassword,
      role: 'candidate',
      bio: 'Passionate frontend developer specialized in React, TypeScript, and minimalist user experiences. 3 years of building modern web applications.',
      skills: ['React', 'TypeScript', 'TailwindCSS', 'CSS', 'JavaScript', 'HTML5', 'Next.js'],
      resumeScore: 85,
      topResumeScore: 85,
      lastResumeScore: 85,
      resumeFeedback: [
        'Great skill alignment for modern web development.',
        'Consider adding back-end skills (e.g. Node.js) to broaden career options.'
      ]
    });

    const candidateBackend = await User.create({
      name: 'Houssem Candidate',
      email: 'houssem@gmail.com',
      password: hashedPassword,
      role: 'candidate',
      bio: 'Backend software engineer with 5+ years of experience building secure REST APIs and microservices. Expert in Node.js and cloud databases.',
      skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'PostgreSQL', 'TypeScript', 'AWS'],
      resumeScore: 90,
      topResumeScore: 90,
      lastResumeScore: 90,
      resumeFeedback: [
        'Strong back-end foundation and database skills.',
        'Add a link to your public GitHub profile or portfolio in your bio.'
      ]
    });

    // Create Jobs
    await Job.create([
      {
        title: 'Frontend Developer',
        company: 'Tesla, Inc.',
        description: 'Join the Energy Products team to design and build stunning, high-performance dashboards for monitoring renewable battery systems. You will work closely with product managers and embedded system engineers.',
        requirements: ['React', 'TypeScript', 'CSS', 'JavaScript'],
        location: 'Palo Alto, CA (Hybrid)',
        salary: '$120,000 - $160,000',
        recruiter: recruiterTesla._id
      },
      {
        title: 'React & UI Specialist',
        company: 'Tesla, Inc.',
        description: 'Help rebuild our core vehicle delivery portal. Focused on sleek micro-interactions, responsive panels, and premium minimalist aesthetics. Absolute mastery of CSS transitions and state management is required.',
        requirements: ['React', 'CSS', 'Next.js', 'TailwindCSS'],
        location: 'Remote (US/Canada)',
        salary: '$130,000 - $170,000',
        recruiter: recruiterTesla._id
      },
      {
        title: 'Backend Node.js Engineer',
        company: 'Google LLC',
        description: 'Build and scale the backend routing API that manages high-volume cloud indexing. Optimize database query times and develop robust automated testing pipelines.',
        requirements: ['Node.js', 'TypeScript', 'Docker', 'PostgreSQL', 'Express'],
        location: 'Mountain View, CA',
        salary: '$160,000 - $210,000',
        recruiter: recruiterGoogle._id
      },
      {
        title: 'Fullstack Software Engineer',
        company: 'Google LLC',
        description: 'Generalist engineering position within Google Cloud team. Balance building clean frontend interfaces with scalable backend infrastructure.',
        requirements: ['TypeScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
        location: 'New York, NY (Hybrid)',
        salary: '$150,000 - $200,000',
        recruiter: recruiterGoogle._id
      }
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

module.exports = seedDB;
