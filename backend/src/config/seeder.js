const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const EmployerProfile = require('../models/EmployerProfile');
const JobPost = require('../models/JobPost');

/** Helper — create a User + matching profile in one call */
async function createEmployer(email, passwordHash, profileData) {
  const user = await User.create({ email, passwordHash, role: 'EMPLOYER' });
  const profile = await EmployerProfile.create({ userId: user._id, ...profileData });
  return { user, profile };
}

async function createEmployee(email, passwordHash, profileData) {
  const user = await User.create({ email, passwordHash, role: 'EMPLOYEE' });
  const skillDocs = (profileData.skills || []).map(name => ({ name }));
  const profile = await EmployeeProfile.create({
    userId: user._id,
    ...profileData,
    skills: skillDocs,
  });
  return { user, profile };
}

async function ensureAdmin() {
  const exists = await User.findOne({ email: 'admin@gmail.com' });
  if (!exists) {
    const passwordHash = await bcrypt.hash('Nokia123456', 12);
    await User.create({ email: 'admin@gmail.com', passwordHash, role: 'ADMIN' });
    console.log('Admin account created: admin@gmail.com');
  }
}

const seedDB = async () => {
  try {
    await ensureAdmin();

    const userCount = await User.countDocuments({});
    if (userCount > 1) {
      console.log('Database already has data — seeding skipped.');
      return;
    }

    console.log('Seeding database…');
    const pw = await bcrypt.hash('password123', 12);

    // ─────────────────────────────────────────────────────────────────────────
    // EMPLOYERS (10 companies across diverse industries)
    // ─────────────────────────────────────────────────────────────────────────
    const { profile: mediCare } = await createEmployer('hr@medicare-group.com', pw, {
      firstName: 'Sarah', lastName: 'Mitchell',
      companyName: 'MediCare Health Group',
      website: 'https://medicare-group.example.com',
      description: 'A leading regional hospital network providing acute care, outpatient services, and community health programs across 12 facilities.',
      location: 'Boston, MA',
    });

    const { profile: finFirst } = await createEmployer('careers@finfirst-bank.com', pw, {
      firstName: 'James', lastName: 'Harrington',
      companyName: 'FinFirst Bank',
      website: 'https://finfirst.example.com',
      description: 'Full-service commercial and retail bank serving 500,000+ clients. We value precision, compliance, and financial integrity.',
      location: 'New York, NY',
    });

    const { profile: buildRight } = await createEmployer('jobs@buildright.com', pw, {
      firstName: 'Marco', lastName: 'Rossi',
      companyName: 'BuildRight Construction',
      website: 'https://buildright.example.com',
      description: 'Award-winning general contractor specialising in commercial buildings, infrastructure, and sustainable architecture across the Southeast.',
      location: 'Atlanta, GA',
    });

    const { profile: eduLearn } = await createEmployer('faculty@edulearn.edu', pw, {
      firstName: 'Linda', lastName: 'Thompson',
      companyName: 'EduLearn Academy',
      website: 'https://edulearn.example.edu',
      description: 'K-12 and higher education institution focused on project-based learning, bilingual programmes, and STEM excellence.',
      location: 'Chicago, IL',
    });

    const { profile: legalEdge } = await createEmployer('recruiting@legaledge.law', pw, {
      firstName: 'David', lastName: 'Chen',
      companyName: 'LegalEdge Law Firm',
      website: 'https://legaledge.example.law',
      description: 'Full-service law firm specialising in corporate law, intellectual property, and employment litigation with offices in 5 cities.',
      location: 'San Francisco, CA',
    });

    const { profile: culinaryArts } = await createEmployer('kitchen@culinary-arts.com', pw, {
      firstName: 'Pierre', lastName: 'Dubois',
      companyName: 'CulinaryArts Restaurant Group',
      website: 'https://culinaryarts.example.com',
      description: 'Operator of 18 upscale restaurants and two culinary schools. We are passionate about seasonal menus, fine dining, and culinary education.',
      location: 'New Orleans, LA',
    });

    const { profile: marketPro } = await createEmployer('talent@marketpro.agency', pw, {
      firstName: 'Aisha', lastName: 'Patel',
      companyName: 'MarketPro Agency',
      website: 'https://marketpro.example.agency',
      description: 'Full-service marketing and communications agency handling brand strategy, digital advertising, and creative campaigns for Fortune 500 clients.',
      location: 'Austin, TX',
    });

    const { profile: mechEng } = await createEmployer('hr@mecheng-industries.com', pw, {
      firstName: 'Klaus', lastName: 'Weber',
      companyName: 'MechEng Industries',
      website: 'https://mecheng.example.com',
      description: 'Precision manufacturing company producing aerospace components, industrial machinery, and automotive parts with ISO 9001 certification.',
      location: 'Detroit, MI',
    });

    const { profile: techNova } = await createEmployer('jobs@technova.io', pw, {
      firstName: 'Priya', lastName: 'Sharma',
      companyName: 'TechNova Solutions',
      website: 'https://technova.example.io',
      description: 'B2B SaaS company building AI-powered supply chain and logistics tools. 150+ enterprise clients worldwide.',
      location: 'Seattle, WA',
    });

    const { profile: humanFirst } = await createEmployer('hire@humanfirst-hr.com', pw, {
      firstName: 'Rachel', lastName: 'Adams',
      companyName: 'HumanFirst HR Consulting',
      website: 'https://humanfirst.example.com',
      description: 'Boutique HR consulting firm specialising in talent acquisition, organisational development, and workforce planning for mid-size companies.',
      location: 'Denver, CO',
    });

    // ─────────────────────────────────────────────────────────────────────────
    // EMPLOYEES (15 candidates across diverse industries)
    // ─────────────────────────────────────────────────────────────────────────
    await createEmployee('amina.nurse@email.com', pw, {
      firstName: 'Amina', lastName: 'Hassan',
      title: 'Registered Nurse',
      bio: 'Experienced ICU nurse with 6 years in acute care. Passionate about patient-centred care and evidence-based practice.',
      location: 'Boston, MA',
      skills: ['patient care', 'ICU', 'triage', 'EMR', 'wound care', 'IV therapy', 'BLS', 'ACLS'],
      experience: [
        { company: 'General Hospital Boston', role: 'ICU Registered Nurse', startDate: '2020-03', endDate: '', current: true, description: 'Manage critically ill patients in a 20-bed ICU, coordinate care with physicians and specialists.' },
        { company: 'Community Health Center', role: 'Staff Nurse', startDate: '2018-06', endDate: '2020-02', current: false, description: 'Provided general nursing care across medical and surgical wards.' },
      ],
      education: [{ institution: 'Boston University', degree: 'Bachelor of Science', field: 'Nursing', startDate: '2014', endDate: '2018' }],
      resumeScore: 82,
    });

    await createEmployee('carlos.accountant@email.com', pw, {
      firstName: 'Carlos', lastName: 'Rivera',
      title: 'Senior Accountant',
      bio: 'CPA with 8 years in public accounting and financial reporting. Detail-oriented with strong knowledge of GAAP and tax compliance.',
      location: 'New York, NY',
      skills: ['accounting', 'GAAP', 'tax compliance', 'financial reporting', 'Excel', 'QuickBooks', 'auditing', 'budgeting'],
      experience: [
        { company: 'Deloitte', role: 'Senior Accountant', startDate: '2019-01', endDate: '', current: true, description: 'Lead audits for mid-size clients, prepare consolidated financial statements, mentor junior staff.' },
        { company: 'Rivera & Associates', role: 'Staff Accountant', startDate: '2016-06', endDate: '2018-12', current: false, description: 'Prepared individual and corporate tax returns, monthly reconciliations.' },
      ],
      education: [{ institution: 'NYU Stern School of Business', degree: 'Bachelor of Science', field: 'Accounting', startDate: '2012', endDate: '2016' }],
      resumeScore: 88,
    });

    await createEmployee('sofia.architect@email.com', pw, {
      firstName: 'Sofia', lastName: 'Moreau',
      title: 'Civil Engineer',
      bio: 'PE-licensed civil engineer with expertise in structural design, site planning, and project management for commercial and residential builds.',
      location: 'Atlanta, GA',
      skills: ['AutoCAD', 'structural design', 'project management', 'site planning', 'Revit', 'soil analysis', 'cost estimation', 'construction management'],
      experience: [
        { company: 'Turner Construction', role: 'Civil Engineer', startDate: '2018-08', endDate: '', current: true, description: 'Design structural systems for commercial projects valued $10M–$80M. Oversee site inspections and contractor coordination.' },
        { company: 'City of Atlanta', role: 'Junior Engineer', startDate: '2016-06', endDate: '2018-07', current: false, description: 'Assisted with road and drainage infrastructure design for municipal projects.' },
      ],
      education: [{ institution: 'Georgia Tech', degree: 'Master of Science', field: 'Civil Engineering', startDate: '2014', endDate: '2016' }],
      resumeScore: 91,
    });

    await createEmployee('leo.teacher@email.com', pw, {
      firstName: 'Leonardo', lastName: 'Martins',
      title: 'High School Mathematics Teacher',
      bio: 'Certified educator with 7 years teaching algebra, calculus, and statistics. Committed to inclusive classrooms and data-driven instruction.',
      location: 'Chicago, IL',
      skills: ['mathematics', 'curriculum development', 'classroom management', 'differentiated instruction', 'algebra', 'calculus', 'Google Classroom', 'student assessment'],
      experience: [
        { company: 'Lincoln High School', role: 'Mathematics Teacher', startDate: '2017-08', endDate: '', current: true, description: 'Teach Algebra II, Pre-Calculus, and AP Statistics to grades 10–12. Average student pass rate 94%.' },
        { company: 'EduLearn Academy', role: 'Substitute Teacher', startDate: '2016-09', endDate: '2017-06', current: false, description: 'Covered STEM subjects across grades 6–12.' },
      ],
      education: [{ institution: 'University of Illinois Chicago', degree: 'Bachelor of Education', field: 'Mathematics', startDate: '2012', endDate: '2016' }],
      resumeScore: 79,
    });

    await createEmployee('nadia.paralegal@email.com', pw, {
      firstName: 'Nadia', lastName: 'Kowalski',
      title: 'Paralegal',
      bio: 'Corporate paralegal with 5 years experience in contract drafting, legal research, and litigation support at top-tier law firms.',
      location: 'San Francisco, CA',
      skills: ['legal research', 'contract drafting', 'litigation support', 'Westlaw', 'LexisNexis', 'case management', 'document review', 'corporate law'],
      experience: [
        { company: 'Morrison & Foerster LLP', role: 'Corporate Paralegal', startDate: '2021-02', endDate: '', current: true, description: 'Support M&A and securities transactions, draft NDAs and service agreements, manage due diligence.' },
        { company: 'Bay Area Legal Aid', role: 'Paralegal', startDate: '2019-06', endDate: '2021-01', current: false, description: 'Assisted attorneys with housing and employment law cases.' },
      ],
      education: [{ institution: 'UC Berkeley Extension', degree: 'Certificate', field: 'Paralegal Studies', startDate: '2018', endDate: '2019' }],
      resumeScore: 84,
    });

    await createEmployee('jean.chef@email.com', pw, {
      firstName: 'Jean-Paul', lastName: 'Fontaine',
      title: 'Sous Chef',
      bio: 'Classically trained sous chef with 10 years in fine dining. Expert in French cuisine, menu development, and kitchen operations.',
      location: 'New Orleans, LA',
      skills: ['French cuisine', 'menu development', 'kitchen management', 'food safety', 'pastry', 'knife skills', 'inventory control', 'HACCP'],
      experience: [
        { company: 'Maison Blanche Restaurant', role: 'Sous Chef', startDate: '2019-03', endDate: '', current: true, description: 'Manage a team of 12 cooks, develop seasonal tasting menus, control food costs to 28%.' },
        { company: 'Hotel Monteleone', role: 'Line Cook', startDate: '2015-06', endDate: '2019-02', current: false, description: 'Executed hot and cold stations in a 200-cover fine dining restaurant.' },
      ],
      education: [{ institution: 'Culinary Institute of America', degree: 'Associate of Occupational Studies', field: 'Culinary Arts', startDate: '2013', endDate: '2015' }],
      resumeScore: 77,
    });

    await createEmployee('priya.marketing@email.com', pw, {
      firstName: 'Priyanka', lastName: 'Mehta',
      title: 'Digital Marketing Specialist',
      bio: 'Results-driven marketer with 5 years growing brand presence through SEO, paid media, and content strategy. Google Ads and HubSpot certified.',
      location: 'Austin, TX',
      skills: ['SEO', 'Google Ads', 'content strategy', 'HubSpot', 'social media marketing', 'email marketing', 'analytics', 'A/B testing'],
      experience: [
        { company: 'GrowthLab Agency', role: 'Digital Marketing Specialist', startDate: '2021-01', endDate: '', current: true, description: 'Manage $500K annual ad spend across Google and Meta, improved client lead volume by 40%.' },
        { company: 'StartupXYZ', role: 'Marketing Coordinator', startDate: '2019-06', endDate: '2020-12', current: false, description: 'Built content calendar, managed social channels, wrote blog articles for SEO.' },
      ],
      education: [{ institution: 'University of Texas Austin', degree: 'Bachelor of Business Administration', field: 'Marketing', startDate: '2015', endDate: '2019' }],
      resumeScore: 85,
    });

    await createEmployee('hans.mechanical@email.com', pw, {
      firstName: 'Hans', lastName: 'Brauer',
      title: 'Mechanical Engineer',
      bio: 'Mechanical engineer with 9 years in aerospace and automotive sectors. Expert in CAD design, FEA simulation, and product lifecycle management.',
      location: 'Detroit, MI',
      skills: ['SolidWorks', 'AutoCAD', 'FEA simulation', 'CATIA', 'GD&T', 'product development', 'thermodynamics', 'CNC machining'],
      experience: [
        { company: 'Ford Motor Company', role: 'Mechanical Engineer', startDate: '2017-05', endDate: '', current: true, description: 'Design powertrain components, run FEA stress analyses, collaborate with manufacturing on DFM.' },
        { company: 'Bosch Automotive', role: 'Junior Engineer', startDate: '2015-06', endDate: '2017-04', current: false, description: 'Supported sensor housing design and validation testing.' },
      ],
      education: [{ institution: 'University of Michigan', degree: 'Master of Science', field: 'Mechanical Engineering', startDate: '2013', endDate: '2015' }],
      resumeScore: 90,
    });

    await createEmployee('fatima.dev@email.com', pw, {
      firstName: 'Fatima', lastName: 'Al-Rashid',
      title: 'Full Stack Developer',
      bio: 'Full stack developer with 4 years building SaaS products. Comfortable from database schema to React UI. Passionate about clean code and fast APIs.',
      location: 'Seattle, WA',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'REST API', 'AWS', 'Git'],
      experience: [
        { company: 'TechNova Solutions', role: 'Full Stack Developer', startDate: '2022-03', endDate: '', current: true, description: 'Build and maintain microservices for logistics platform, deliver React dashboards for 50+ enterprise clients.' },
        { company: 'Freelance', role: 'Web Developer', startDate: '2020-01', endDate: '2022-02', current: false, description: 'Developed e-commerce sites and REST APIs for 12 small business clients.' },
      ],
      education: [{ institution: 'University of Washington', degree: 'Bachelor of Science', field: 'Computer Science', startDate: '2016', endDate: '2020' }],
      resumeScore: 88,
    });

    await createEmployee('grace.hr@email.com', pw, {
      firstName: 'Grace', lastName: 'Okonkwo',
      title: 'HR Business Partner',
      bio: 'SHRM-CP certified HR professional with 7 years partnering with business leaders on talent strategy, performance management, and DEI initiatives.',
      location: 'Denver, CO',
      skills: ['talent acquisition', 'performance management', 'employee relations', 'HRIS', 'DEI', 'onboarding', 'compensation planning', 'organisational development'],
      experience: [
        { company: 'Accenture', role: 'HR Business Partner', startDate: '2020-06', endDate: '', current: true, description: 'Support 300-person business unit with workforce planning, talent reviews, and HR policy implementation.' },
        { company: 'Nexus Tech', role: 'HR Generalist', startDate: '2017-08', endDate: '2020-05', current: false, description: 'Managed full-cycle recruitment, onboarding, and employee engagement programmes.' },
      ],
      education: [{ institution: 'University of Denver', degree: 'Bachelor of Science', field: 'Human Resources Management', startDate: '2013', endDate: '2017' }],
      resumeScore: 83,
    });

    await createEmployee('omar.pharmacist@email.com', pw, {
      firstName: 'Omar', lastName: 'Benali',
      title: 'Clinical Pharmacist',
      bio: 'PharmD with 5 years in clinical pharmacy. Specialises in medication therapy management, patient counselling, and anticoagulation clinics.',
      location: 'Boston, MA',
      skills: ['medication management', 'patient counselling', 'pharmacology', 'clinical reviews', 'anticoagulation', 'EMR', 'drug interactions', 'IV compounding'],
      experience: [
        { company: 'Mass General Hospital', role: 'Clinical Pharmacist', startDate: '2021-07', endDate: '', current: true, description: 'Review patient medication regimens, counsel on drug interactions, manage warfarin clinic independently.' },
        { company: 'CVS Health', role: 'Staff Pharmacist', startDate: '2019-06', endDate: '2021-06', current: false, description: 'Dispensed prescriptions, conducted annual wellness consultations, trained pharmacy technicians.' },
      ],
      education: [{ institution: 'Northeastern University', degree: 'Doctor of Pharmacy', field: 'Pharmacy', startDate: '2015', endDate: '2019' }],
      resumeScore: 87,
    });

    await createEmployee('isabelle.finance@email.com', pw, {
      firstName: 'Isabelle', lastName: 'Leclerc',
      title: 'Financial Analyst',
      bio: 'CFA Level II candidate with 4 years in investment analysis and corporate finance. Skilled at building financial models and presenting to executive teams.',
      location: 'New York, NY',
      skills: ['financial modelling', 'Excel', 'valuation', 'DCF analysis', 'Bloomberg Terminal', 'SQL', 'PowerPoint', 'budgeting'],
      experience: [
        { company: 'JPMorgan Chase', role: 'Financial Analyst', startDate: '2022-07', endDate: '', current: true, description: 'Build three-statement models and DCF analyses for M&A advisory deals, present findings to MDs.' },
        { company: 'KPMG', role: 'Analyst', startDate: '2020-07', endDate: '2022-06', current: false, description: 'Supported valuations for transaction services engagements.' },
      ],
      education: [{ institution: 'Columbia University', degree: 'Bachelor of Science', field: 'Finance', startDate: '2016', endDate: '2020' }],
      resumeScore: 92,
    });

    await createEmployee('tom.projectmgr@email.com', pw, {
      firstName: 'Thomas', lastName: 'Nguyen',
      title: 'Project Manager',
      bio: 'PMP-certified project manager with 8 years delivering large-scale construction and infrastructure projects on time and within budget.',
      location: 'Atlanta, GA',
      skills: ['project management', 'PMP', 'MS Project', 'risk management', 'budgeting', 'stakeholder management', 'Primavera P6', 'construction scheduling'],
      experience: [
        { company: 'Skanska USA', role: 'Senior Project Manager', startDate: '2019-04', endDate: '', current: true, description: 'Lead a $45M commercial office tower project from design to handover, managing 8 subcontractors.' },
        { company: 'Jacobs Engineering', role: 'Project Manager', startDate: '2016-06', endDate: '2019-03', current: false, description: 'Managed road widening and bridge rehabilitation projects for state DOT clients.' },
      ],
      education: [{ institution: 'Purdue University', degree: 'Bachelor of Science', field: 'Construction Management', startDate: '2012', endDate: '2016' }],
      resumeScore: 89,
    });

    await createEmployee('mei.content@email.com', pw, {
      firstName: 'Mei', lastName: 'Lin',
      title: 'Content Strategist',
      bio: 'Creative content strategist with 6 years producing editorial, brand, and social content that drives organic traffic and audience engagement.',
      location: 'Austin, TX',
      skills: ['content strategy', 'SEO writing', 'copywriting', 'editorial planning', 'social media', 'brand voice', 'WordPress', 'Google Analytics'],
      experience: [
        { company: 'MarketPro Agency', role: 'Content Strategist', startDate: '2021-03', endDate: '', current: true, description: 'Lead content strategy for 6 B2B accounts, grew organic blog traffic by 120% in 18 months.' },
        { company: 'Forbes', role: 'Staff Writer', startDate: '2018-09', endDate: '2021-02', current: false, description: 'Wrote 3-5 tech and business articles per week, specialising in startup ecosystem coverage.' },
      ],
      education: [{ institution: 'NYU', degree: 'Bachelor of Arts', field: 'Journalism', startDate: '2014', endDate: '2018' }],
      resumeScore: 81,
    });

    await createEmployee('rania.data@email.com', pw, {
      firstName: 'Rania', lastName: 'Aziz',
      title: 'Data Analyst',
      bio: 'Data analyst with 3 years turning raw business data into actionable insights using SQL, Python, and Tableau. Passionate about healthcare data.',
      location: 'Boston, MA',
      skills: ['SQL', 'Python', 'Tableau', 'data visualisation', 'Excel', 'statistical analysis', 'Power BI', 'data cleaning'],
      experience: [
        { company: 'MediCare Health Group', role: 'Data Analyst', startDate: '2023-01', endDate: '', current: true, description: 'Analyse patient outcomes data, build Tableau dashboards for clinical directors, support quality improvement initiatives.' },
        { company: 'Accenture', role: 'Business Analyst Intern', startDate: '2022-06', endDate: '2022-12', current: false, description: 'Assisted with process mapping and data migration for healthcare client.' },
      ],
      education: [{ institution: 'Boston University', degree: 'Bachelor of Science', field: 'Health Informatics', startDate: '2018', endDate: '2022' }],
      resumeScore: 80,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // JOB POSTS (30 openings across all industries)
    // ─────────────────────────────────────────────────────────────────────────
    await JobPost.create([
      // ── Healthcare ────────────────────────────────────────────────────────
      {
        employerProfileId: mediCare._id, title: 'Registered Nurse – ICU',
        description: 'We are seeking experienced ICU nurses to join our Level I Trauma Center. You will manage critically ill patients, administer medications, and collaborate with intensivists and specialists. Night and day shifts available.',
        requiredSkills: ['patient care', 'ICU', 'triage', 'EMR', 'IV therapy', 'ACLS'],
        location: 'Boston, MA', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: mediCare._id, title: 'Clinical Pharmacist',
        description: 'Join our pharmacy team to provide medication therapy management, review clinical orders, and run our anticoagulation clinic. You will work directly with physicians and nursing staff.',
        requiredSkills: ['medication management', 'pharmacology', 'anticoagulation', 'EMR', 'patient counselling'],
        location: 'Boston, MA', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: mediCare._id, title: 'Healthcare Data Analyst',
        description: 'Analyse patient outcomes, length of stay, and readmission data to support quality improvement. Build dashboards for clinical leadership and identify patterns that reduce adverse events.',
        requiredSkills: ['SQL', 'Tableau', 'data visualisation', 'Excel', 'statistical analysis'],
        location: 'Boston, MA', type: 'FULL_TIME', status: 'OPEN',
      },

      // ── Finance ───────────────────────────────────────────────────────────
      {
        employerProfileId: finFirst._id, title: 'Senior Financial Analyst',
        description: 'Support our corporate finance team with financial modelling, variance analysis, and board-level reporting. You will own quarterly forecasts and present findings to the CFO.',
        requiredSkills: ['financial modelling', 'Excel', 'budgeting', 'DCF analysis', 'PowerPoint'],
        location: 'New York, NY', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: finFirst._id, title: 'Senior Accountant',
        description: 'Manage month-end close, prepare GAAP-compliant financial statements, and liaise with external auditors. Strong knowledge of regulatory reporting requirements expected.',
        requiredSkills: ['accounting', 'GAAP', 'auditing', 'financial reporting', 'Excel', 'QuickBooks'],
        location: 'New York, NY', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: finFirst._id, title: 'Compliance Analyst',
        description: 'Monitor banking operations for regulatory compliance, conduct internal audits, and maintain AML/KYC documentation. Experience with financial regulations required.',
        requiredSkills: ['auditing', 'tax compliance', 'financial reporting', 'risk management', 'Excel'],
        location: 'New York, NY', type: 'CONTRACT', status: 'OPEN',
      },

      // ── Construction ──────────────────────────────────────────────────────
      {
        employerProfileId: buildRight._id, title: 'Civil Engineer – Structural',
        description: 'Design structural systems for mid-rise commercial buildings. Work with architects and MEP engineers to coordinate building systems. Site visits required during construction phase.',
        requiredSkills: ['AutoCAD', 'structural design', 'Revit', 'cost estimation', 'construction management'],
        location: 'Atlanta, GA', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: buildRight._id, title: 'Senior Project Manager',
        description: 'Lead the delivery of commercial construction projects from preconstruction through final handover. Manage subcontractors, control budgets of $20M–$60M, and ensure schedule adherence.',
        requiredSkills: ['project management', 'PMP', 'risk management', 'stakeholder management', 'construction scheduling'],
        location: 'Atlanta, GA', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: buildRight._id, title: 'Site Engineer',
        description: 'Oversee day-to-day site operations, quality inspections, and subcontractor supervision. Prepare RFIs and site reports. Minimum 3 years experience on commercial sites.',
        requiredSkills: ['site planning', 'structural design', 'AutoCAD', 'project management', 'soil analysis'],
        location: 'Savannah, GA', type: 'FULL_TIME', status: 'OPEN',
      },

      // ── Education ─────────────────────────────────────────────────────────
      {
        employerProfileId: eduLearn._id, title: 'High School Mathematics Teacher',
        description: 'Teach Algebra II, Pre-Calculus, and AP Statistics to grades 10–12. Design engaging lesson plans, track student progress, and maintain a supportive learning environment.',
        requiredSkills: ['mathematics', 'curriculum development', 'classroom management', 'student assessment', 'algebra'],
        location: 'Chicago, IL', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: eduLearn._id, title: 'STEM Curriculum Developer',
        description: 'Design and update K-12 STEM curriculum aligned to state standards. Collaborate with teachers, conduct pilot lessons, and produce digital learning materials.',
        requiredSkills: ['curriculum development', 'mathematics', 'differentiated instruction', 'Google Classroom', 'student assessment'],
        location: 'Chicago, IL', type: 'PART_TIME', status: 'OPEN',
      },

      // ── Legal ─────────────────────────────────────────────────────────────
      {
        employerProfileId: legalEdge._id, title: 'Corporate Paralegal',
        description: 'Support our M&A and corporate transactional team with due diligence, contract drafting, entity management, and closing documentation. Fast-paced, detail-oriented environment.',
        requiredSkills: ['legal research', 'contract drafting', 'corporate law', 'document review', 'Westlaw'],
        location: 'San Francisco, CA', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: legalEdge._id, title: 'Litigation Support Specialist',
        description: 'Assist trial attorneys with case preparation, e-discovery management, deposition summaries, and trial logistics. Proficiency with litigation management software required.',
        requiredSkills: ['litigation support', 'document review', 'LexisNexis', 'case management', 'legal research'],
        location: 'San Francisco, CA', type: 'FULL_TIME', status: 'OPEN',
      },

      // ── Hospitality / Culinary ────────────────────────────────────────────
      {
        employerProfileId: culinaryArts._id, title: 'Sous Chef',
        description: 'Lead the kitchen brigade in the absence of the Head Chef. Develop daily specials, manage food ordering and waste, train junior cooks, and ensure HACCP compliance at all times.',
        requiredSkills: ['kitchen management', 'menu development', 'food safety', 'HACCP', 'inventory control'],
        location: 'New Orleans, LA', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: culinaryArts._id, title: 'Pastry Chef',
        description: 'Create innovative dessert menus for our flagship restaurant. Manage pastry mise en place, train pastry cooks, and develop seasonal confectionery for our culinary school.',
        requiredSkills: ['pastry', 'menu development', 'food safety', 'French cuisine', 'knife skills'],
        location: 'New Orleans, LA', type: 'FULL_TIME', status: 'OPEN',
      },

      // ── Marketing ─────────────────────────────────────────────────────────
      {
        employerProfileId: marketPro._id, title: 'Digital Marketing Specialist',
        description: 'Manage paid media campaigns on Google and Meta for a portfolio of B2B clients. Optimise performance, produce weekly reports, and collaborate with creative teams on ad assets.',
        requiredSkills: ['Google Ads', 'SEO', 'analytics', 'A/B testing', 'social media marketing', 'email marketing'],
        location: 'Austin, TX', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: marketPro._id, title: 'Content Strategist',
        description: 'Define and execute content strategies for 4–6 client accounts. Oversee editorial calendars, write long-form SEO content, and report on traffic and engagement metrics monthly.',
        requiredSkills: ['content strategy', 'SEO writing', 'copywriting', 'editorial planning', 'Google Analytics'],
        location: 'Austin, TX', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: marketPro._id, title: 'Brand Strategist',
        description: 'Lead brand positioning and messaging projects for Fortune 500 clients. Conduct market research, run workshops, and produce brand identity guidelines.',
        requiredSkills: ['content strategy', 'brand voice', 'copywriting', 'social media marketing', 'analytics'],
        location: 'Austin, TX', type: 'CONTRACT', status: 'OPEN',
      },

      // ── Mechanical / Manufacturing ────────────────────────────────────────
      {
        employerProfileId: mechEng._id, title: 'Mechanical Design Engineer',
        description: 'Design precision mechanical components for aerospace applications. Use SolidWorks and CATIA for 3D modelling, run FEA simulations, and validate designs through physical testing.',
        requiredSkills: ['SolidWorks', 'CATIA', 'FEA simulation', 'GD&T', 'product development'],
        location: 'Detroit, MI', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: mechEng._id, title: 'Manufacturing Engineer',
        description: 'Optimise production processes for CNC machined automotive parts. Develop work instructions, troubleshoot quality issues, and drive continuous improvement initiatives.',
        requiredSkills: ['CNC machining', 'AutoCAD', 'GD&T', 'product development', 'thermodynamics'],
        location: 'Detroit, MI', type: 'FULL_TIME', status: 'OPEN',
      },

      // ── Tech ──────────────────────────────────────────────────────────────
      {
        employerProfileId: techNova._id, title: 'Full Stack Developer',
        description: 'Build and scale features across our logistics SaaS platform. Own end-to-end delivery from API design (Node.js) to React dashboards. Work in a cross-functional agile team.',
        requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'REST API'],
        location: 'Seattle, WA', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: techNova._id, title: 'Data Engineer',
        description: 'Design and maintain data pipelines that feed our ML models and analytics dashboards. Work with Python, SQL, and AWS data services to ensure reliable, scalable data infrastructure.',
        requiredSkills: ['Python', 'SQL', 'AWS', 'data cleaning', 'statistical analysis', 'Docker'],
        location: 'Seattle, WA', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: techNova._id, title: 'Product Manager – Logistics',
        description: 'Define product strategy for our carrier network optimisation tools. Conduct user research, write PRDs, and work with engineering to ship features that delight our enterprise customers.',
        requiredSkills: ['stakeholder management', 'project management', 'analytics', 'Excel', 'SQL'],
        location: 'Remote', type: 'REMOTE', status: 'OPEN',
      },

      // ── HR Consulting ─────────────────────────────────────────────────────
      {
        employerProfileId: humanFirst._id, title: 'HR Business Partner',
        description: 'Embed with client teams to drive talent strategy, manage performance cycles, and resolve complex employee relations issues. You will support 3–5 client organisations simultaneously.',
        requiredSkills: ['talent acquisition', 'performance management', 'employee relations', 'organisational development', 'HRIS'],
        location: 'Denver, CO', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: humanFirst._id, title: 'Talent Acquisition Specialist',
        description: 'Run full-cycle recruitment for client companies across finance, healthcare, and technology. Source passive candidates, manage ATS pipelines, and deliver an exceptional candidate experience.',
        requiredSkills: ['talent acquisition', 'onboarding', 'HRIS', 'compensation planning', 'DEI'],
        location: 'Denver, CO', type: 'FULL_TIME', status: 'OPEN',
      },
      {
        employerProfileId: humanFirst._id, title: 'Compensation & Benefits Analyst',
        description: 'Conduct benchmarking studies, design competitive salary bands, and advise clients on benefits programme design. Strong analytical skills and discretion required.',
        requiredSkills: ['compensation planning', 'Excel', 'organisational development', 'budgeting', 'performance management'],
        location: 'Denver, CO', type: 'PART_TIME', status: 'OPEN',
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('   10 employers · 15 candidates · 30 job posts across 9 industries');
    console.log('   All accounts use password: password123');
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
};

module.exports = seedDB;
