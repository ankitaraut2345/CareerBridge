const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity.model');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Seed demo opportunities for instant offline development and realistic testing
const DEMO_OPPORTUNITIES = [
  {
    _id: 'opp_google_swe_2026',
    title: 'Software Development Engineer - Campus Graduate',
    type: 'PLACEMENT',
    companyName: 'Google',
    companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://careers.google.com',
    description:
      'Join Google Engineering to build distributed, scalable web services and systems that power billions of daily search and cloud operations worldwide. You will collaborate with elite software architects and contribute to mission-critical infrastructure.',
    responsibilities:
      'Design, develop, test, deploy, maintain, and enhance large-scale distributed software solutions.\nCollaborate with product management and site reliability teams.\nParticipate in agile sprints, peer code reviews, and architectural RFC discussions.',
    requiredSkills: ['Data Structures', 'Algorithms', 'Java', 'C++', 'System Design'],
    preferredSkills: ['Distributed Systems', 'Cloud Computing', 'Kubernetes', 'Go'],
    role: 'Software Development Engineer - I',
    department: 'Core Search & Infrastructure',
    workMode: 'HYBRID',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Full-time',
    experienceRequired: 'Fresh Graduate / 0-1 Years',
    salary: '24 - 32 LPA',
    salaryPeriod: 'Per Annum',
    stipend: '',
    otherBenefits: 'Comprehensive Health Insurance, Stock Units (RSUs), Free Meals & Transport, Wellness Allowance',
    eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Data Science'],
    eligibleGraduationYears: [2025, 2026, 2027],
    minimumCGPA: 7.5,
    maximumBacklogs: 0,
    additionalEligibilityCriteria: 'No active disciplinary actions or pending academic grade holds.',
    applicationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
    applicationStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    externalApplicationUrl: 'https://careers.google.com/jobs/results/',
    applicationInstructions: 'Upload updated resume in PDF format. Keep college ID card handy for registration.',
    status: 'PUBLISHED',
    createdBy: 'demo_tpo',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'opp_msft_cloud_intern',
    title: 'Azure Cloud Platform Engineering Intern',
    type: 'INTERNSHIP',
    companyName: 'Microsoft',
    companyLogo: 'https://images.unsplash.com/photo-1642132652859-3ef5a1048fd1?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://careers.microsoft.com',
    description:
      'The Azure Cloud Platform Engineering team is seeking passionate engineering interns to engineer enterprise-grade cloud native tooling, automated deployment services, and serverless infrastructure.',
    responsibilities:
      'Develop microservices using modern cloud frameworks and Azure SDKs.\nInstrument telemetry and observability metrics for high-throughput cloud APIs.\nWork closely with senior mentors on real-world customer telemetry problems.',
    requiredSkills: ['Python', 'Azure', 'Linux', 'Docker', 'REST APIs'],
    preferredSkills: ['Kubernetes', 'Go', 'Microservices', 'Git'],
    role: 'Cloud Engineering Intern (6 Months)',
    department: 'Azure Developer Experience',
    workMode: 'ONSITE',
    location: 'Hyderabad, Telangana',
    employmentType: 'Internship (6 Months)',
    experienceRequired: 'Enrolled Bachelor Student',
    salary: '',
    salaryPeriod: '',
    stipend: '₹80,000 / month',
    otherBenefits: 'Housing stipend or corporate accommodation, Relocation flight, PPO consideration based on review',
    eligibleDepartments: ['Computer Science', 'Information Technology', 'Data Science', 'AI & Machine Learning'],
    eligibleGraduationYears: [2026, 2027],
    minimumCGPA: 7.0,
    maximumBacklogs: 0,
    additionalEligibilityCriteria: 'Available for full-time 6-month in-office internship starting next semester.',
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    applicationStartDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    externalApplicationUrl: 'https://careers.microsoft.com/students',
    applicationInstructions: 'Submit GitHub repository links and top academic projects along with your application.',
    status: 'PUBLISHED',
    createdBy: 'demo_tpo',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'opp_amazon_frontend_intern',
    title: 'Frontend Web Engineering Intern',
    type: 'INTERNSHIP',
    companyName: 'Amazon',
    companyLogo: 'https://images.unsplash.com/photo-1523474253243-282a0762d115?w=128&auto=format&fit=crop&q=80',
    companyWebsite: 'https://amazon.jobs',
    description:
      'Build customer-obsessed user interfaces and responsive web applications for millions of shoppers worldwide. Work with React, TypeScript, and modern design systems to optimize web performance and accessibility.',
    responsibilities:
      'Implement accessible, responsive UI widgets following Amazon design specifications.\nOptimize bundle sizes, Time-to-Interactive, and Core Web Vitals.\nWrite comprehensive end-to-end and component tests.',
    requiredSkills: ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3'],
    preferredSkills: ['Next.js', 'Tailwind CSS', 'Redux', 'Jest'],
    role: 'Frontend Engineering Intern',
    department: 'Customer Experience eCommerce',
    workMode: 'REMOTE',
    location: 'Remote / Pan-India',
    employmentType: 'Internship (3-6 Months)',
    experienceRequired: 'Enrolled Bachelor Student',
    salary: '',
    salaryPeriod: '',
    stipend: '₹65,000 / month',
    otherBenefits: 'Monthly remote work equipment stipend, Mentor pair programming, Full PPO track',
    eligibleDepartments: ['Computer Science', 'Information Technology', 'Electrical Engineering', 'Mechanical Engineering'],
    eligibleGraduationYears: [2026, 2027],
    minimumCGPA: 6.5,
    maximumBacklogs: 1,
    additionalEligibilityCriteria: 'Stable high-speed home broadband connection required for remote work setup.',
    applicationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Closing soon (4 days)
    applicationStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    externalApplicationUrl: '',
    applicationInstructions: 'Portfolio or live website demo link strongly recommended in candidate profile.',
    status: 'PUBLISHED',
    createdBy: 'demo_tpo',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'opp_goldman_draft',
    title: 'Technology Analyst - Quantitative & Platform Engineering',
    type: 'PLACEMENT',
    companyName: 'Goldman Sachs',
    companyLogo: '',
    companyWebsite: 'https://goldmansachs.com/careers',
    description:
      'Work alongside global financial engineering desks developing high-speed market transaction processors, risk modeling analytics, and compliance microservices.',
    responsibilities:
      'Engineer low-latency microservices for quantitative pricing engines.\nDevelop automated regulatory risk metrics and data reconciliation pipelines.',
    requiredSkills: ['C++', 'Python', 'Financial Engineering', 'SQL', 'Multithreading'],
    preferredSkills: ['Kafka', 'Docker', 'Financial Markets Basics'],
    role: 'Technology Analyst (Graduate)',
    department: 'Global Markets Engineering',
    workMode: 'ONSITE',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Full-time',
    experienceRequired: 'Fresh Graduate',
    salary: '22 LPA + Joining Bonus',
    salaryPeriod: 'Per Annum',
    stipend: '',
    otherBenefits: 'Annual Performance Bonus, Global Relocation Assist, Executive Health Coverage',
    eligibleDepartments: ['Computer Science', 'Information Technology', 'Mathematics & Computing'],
    eligibleGraduationYears: [2025, 2026],
    minimumCGPA: 8.0,
    maximumBacklogs: 0,
    additionalEligibilityCriteria: 'Candidate must clear mandatory online algorithmic coding and aptitude assessment.',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationStartDate: new Date(),
    externalApplicationUrl: '',
    applicationInstructions: 'Draft drive - awaiting placement committee confirmation.',
    status: 'DRAFT',
    createdBy: 'demo_tpo',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    _id: 'opp_infosys_closed',
    title: 'Specialist Programmer - Campus Drive',
    type: 'PLACEMENT',
    companyName: 'Infosys',
    companyLogo: '',
    companyWebsite: 'https://infosys.com/careers',
    description:
      'High-complexity algorithmic programming track focusing on emerging tech stacks including GenAI, Cloud Migration, and Enterprise Modernization.',
    responsibilities:
      'Develop cloud-ready microservices and participate in full-stack modernization drives.',
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'Algorithms'],
    preferredSkills: ['AWS', 'Microservices'],
    role: 'Specialist Programmer',
    department: 'Enterprise Application Services',
    workMode: 'HYBRID',
    location: 'Pune, Maharashtra',
    employmentType: 'Full-time',
    experienceRequired: 'Fresh Graduate',
    salary: '9.5 LPA',
    salaryPeriod: 'Per Annum',
    stipend: '',
    otherBenefits: 'Standard campus medical insurance and annual performance appraisals',
    eligibleDepartments: ['Computer Science', 'Information Technology', 'Electronics & Communication'],
    eligibleGraduationYears: [2025, 2026],
    minimumCGPA: 6.0,
    maximumBacklogs: 0,
    additionalEligibilityCriteria: 'Must have successfully completed all core degree curriculum requirements.',
    applicationDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Deadline passed 5 days ago
    applicationStartDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    externalApplicationUrl: '',
    applicationInstructions: 'Drive concluded.',
    status: 'CLOSED',
    createdBy: 'demo_tpo',
    closedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

let OPPORTUNITIES_SEED = [];
try {
  OPPORTUNITIES_SEED = require('../seed/seedData').OPPORTUNITIES_SEED;
} catch {}

const allSeedOpps = (OPPORTUNITIES_SEED && OPPORTUNITIES_SEED.length > 0)
  ? OPPORTUNITIES_SEED.map((o) => ({
      ...o,
      _id: o.key,
      createdBy: 'demo_tpo',
      updatedBy: 'demo_tpo',
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  : DEMO_OPPORTUNITIES;

// In-memory array clone
const memoryOpportunities = allSeedOpps.map((opp) => ({
  ...opp,
  applicationDeadline: new Date(opp.applicationDeadline),
  applicationStartDate: new Date(opp.applicationStartDate || Date.now()),
  publishedAt: opp.status === 'PUBLISHED' ? new Date(opp.applicationStartDate || Date.now()) : undefined,
  closedAt: opp.closedAt ? new Date(opp.closedAt) : undefined,
  createdAt: opp.createdAt ? new Date(opp.createdAt) : new Date(),
  updatedAt: opp.updatedAt ? new Date(opp.updatedAt) : new Date(),
}));

/**
 * Seed demo opportunities into MongoDB if online and empty
 */
const seedDemoOpportunitiesIntoDb = async () => {
  if (!isDbConnected()) return;
  try {
    const count = await Opportunity.countDocuments();
    if (count === 0) {
      for (const item of DEMO_OPPORTUNITIES) {
        const doc = { ...item };
        delete doc._id; // Let Mongo generate _id or keep string
        await Opportunity.create(doc);
      }
      console.log(`🌱 Seeded ${DEMO_OPPORTUNITIES.length} demo opportunities into MongoDB`);
    }
  } catch (err) {
    console.error('Error seeding demo opportunities into DB:', err.message);
  }
};

/**
 * Filter, sort, and paginate opportunities
 */
const findOpportunities = async ({
  search = '',
  type,
  workMode,
  location,
  department,
  graduationYear,
  status,
  sort = 'newest',
  page = 1,
  limit = 10,
  createdBy,
  userRole,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // ── MONGO DB PATH ────────────────────────────────────────────────────────
  if (isDbConnected()) {
    const filter = {};

    // Role-based visibility
    if (userRole === 'STUDENT' || userRole === 'ALUMNI') {
      filter.status = 'PUBLISHED';
    } else if (status) {
      filter.status = status;
    }

    if (createdBy && (userRole === 'TPO')) {
      filter.createdBy = createdBy;
    }

    if (type) {
      filter.type = type.toUpperCase();
    }

    if (workMode) {
      filter.workMode = workMode.toUpperCase();
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (department) {
      filter.eligibleDepartments = { $in: [new RegExp(department, 'i')] };
    }

    if (graduationYear) {
      filter.eligibleGraduationYears = { $in: [Number(graduationYear)] };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { companyName: searchRegex },
        { role: searchRegex },
        { requiredSkills: searchRegex },
        { location: searchRegex },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'deadlineSoonest') sortOption = { applicationDeadline: 1 };
    else if (sort === 'deadlineLatest') sortOption = { applicationDeadline: -1 };

    const [items, totalItems] = await Promise.all([
      Opportunity.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Opportunity.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return {
      opportunities: items.map((i) => ({ ...i, id: i._id.toString() })),
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
        limit: limitNum,
      },
    };
  }

  // ── IN-MEMORY FALLBACK PATH ──────────────────────────────────────────────
  let filtered = [...memoryOpportunities];

  // RBAC constraints
  if (userRole === 'STUDENT' || userRole === 'ALUMNI') {
    filtered = filtered.filter((opp) => opp.status === 'PUBLISHED');
  } else if (status) {
    filtered = filtered.filter((opp) => opp.status === status);
  }

  if (createdBy && userRole === 'TPO') {
    // If filtering by specific TPO creator
    filtered = filtered.filter((opp) => String(opp.createdBy) === String(createdBy));
  }

  if (type) {
    filtered = filtered.filter((opp) => opp.type === type.toUpperCase());
  }

  if (workMode) {
    filtered = filtered.filter((opp) => opp.workMode === workMode.toUpperCase());
  }

  if (location) {
    const locLower = location.toLowerCase();
    filtered = filtered.filter((opp) => opp.location.toLowerCase().includes(locLower));
  }

  if (department) {
    const deptLower = department.toLowerCase();
    filtered = filtered.filter(
      (opp) =>
        opp.eligibleDepartments &&
        opp.eligibleDepartments.some((d) => d.toLowerCase().includes(deptLower))
    );
  }

  if (graduationYear) {
    const yr = Number(graduationYear);
    filtered = filtered.filter(
      (opp) => opp.eligibleGraduationYears && opp.eligibleGraduationYears.includes(yr)
    );
  }

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter((opp) => {
      return (
        opp.title.toLowerCase().includes(term) ||
        opp.companyName.toLowerCase().includes(term) ||
        opp.role.toLowerCase().includes(term) ||
        opp.location.toLowerCase().includes(term) ||
        (opp.requiredSkills && opp.requiredSkills.some((s) => s.toLowerCase().includes(term)))
      );
    });
  }

  // Sorting
  filtered.sort((a, b) => {
    if (sort === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sort === 'deadlineSoonest') {
      return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
    }
    if (sort === 'deadlineLatest') {
      return new Date(b.applicationDeadline).getTime() - new Date(a.applicationDeadline).getTime();
    }
    // Default newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limitNum) || 1;
  const pagedItems = filtered.slice(skip, skip + limitNum).map((opp) => ({
    ...opp,
    id: opp._id ? opp._id.toString() : opp.id,
  }));

  return {
    opportunities: pagedItems,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
      limit: limitNum,
    },
  };
};

/**
 * Find opportunity by ID
 */
const findOpportunityById = async (id) => {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const opp = await Opportunity.findById(id).lean();
      if (opp) return { ...opp, id: opp._id.toString() };
    }
  }

  const mem = memoryOpportunities.find(
    (o) =>
      (o._id ? o._id.toString() : o.id) === id ||
      o._id === id ||
      (id === 'opp_google_swe' && (o._id === 'opp_google_swe_2026' || o.id === 'opp_google_swe_2026')) ||
      (id === 'opp_google_swe_2026' && (o._id === 'opp_google_swe' || o.id === 'opp_google_swe'))
  );
  if (mem) {
    return { ...mem, id: mem._id ? mem._id.toString() : mem.id };
  }
  return null;
};

/**
 * Create opportunity
 */
const createOpportunity = async (data) => {
  if (isDbConnected()) {
    const opp = await Opportunity.create(data);
    const obj = opp.toObject();
    return { ...obj, id: obj._id.toString() };
  }

  const newOpp = {
    ...data,
    _id: 'opp_' + Date.now(),
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: data.status === 'PUBLISHED' ? new Date() : undefined,
  };
  memoryOpportunities.unshift(newOpp);
  return { ...newOpp, id: newOpp._id };
};

/**
 * Update opportunity
 */
const updateOpportunity = async (id, updates) => {
  updates.updatedAt = new Date();

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const opp = await Opportunity.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).lean();
    if (opp) return { ...opp, id: opp._id.toString() };
  }

  const index = memoryOpportunities.findIndex(
    (o) => (o._id ? o._id.toString() : o.id) === id || o._id === id
  );
  if (index !== -1) {
    const updated = {
      ...memoryOpportunities[index],
      ...updates,
      updatedAt: new Date(),
    };
    memoryOpportunities[index] = updated;
    return { ...updated, id: updated._id };
  }

  return null;
};

/**
 * Delete opportunity
 */
const deleteOpportunity = async (id) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const result = await Opportunity.findByIdAndDelete(id);
    return !!result;
  }

  const index = memoryOpportunities.findIndex(
    (o) => (o._id ? o._id.toString() : o.id) === id || o._id === id
  );
  if (index !== -1) {
    memoryOpportunities.splice(index, 1);
    return true;
  }

  return false;
};

/**
 * Get opportunity stats for TPO / Admin dashboard
 */
const getOpportunityStats = async (tpoUserId, userRole) => {
  if (isDbConnected()) {
    const filter = {};
    if (userRole === 'TPO' && tpoUserId) {
      filter.createdBy = tpoUserId;
    }

    const [total, published, draft, closed, archived, placements, internships] = await Promise.all([
      Opportunity.countDocuments(filter),
      Opportunity.countDocuments({ ...filter, status: 'PUBLISHED' }),
      Opportunity.countDocuments({ ...filter, status: 'DRAFT' }),
      Opportunity.countDocuments({ ...filter, status: 'CLOSED' }),
      Opportunity.countDocuments({ ...filter, status: 'ARCHIVED' }),
      Opportunity.countDocuments({ ...filter, type: 'PLACEMENT' }),
      Opportunity.countDocuments({ ...filter, type: 'INTERNSHIP' }),
    ]);

    return {
      total,
      published,
      draft,
      closed,
      archived,
      placements,
      internships,
    };
  }

  let items = [...memoryOpportunities];
  if (userRole === 'TPO' && tpoUserId) {
    items = items.filter((o) => String(o.createdBy) === String(tpoUserId));
  }

  return {
    total: items.length,
    published: items.filter((o) => o.status === 'PUBLISHED').length,
    draft: items.filter((o) => o.status === 'DRAFT').length,
    closed: items.filter((o) => o.status === 'CLOSED').length,
    archived: items.filter((o) => o.status === 'ARCHIVED').length,
    placements: items.filter((o) => o.type === 'PLACEMENT').length,
    internships: items.filter((o) => o.type === 'INTERNSHIP').length,
  };
};

module.exports = {
  isDbConnected,
  seedDemoOpportunitiesIntoDb,
  findOpportunities,
  findOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityStats,
};
