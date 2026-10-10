const mongoose = require('mongoose');
const ReferralOpportunity = require('../models/ReferralOpportunity.model');
const ReferralRequest = require('../models/ReferralRequest.model');
const { findProfileByUserId: findAlumniProfile } = require('./alumniProfileStore.service');
const { findProfileByUserId: findStudentProfile } = require('./studentProfileStore.service');
const { findUserById } = require('./userStore.service');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/error');

const isDbConnected = () => mongoose.connection.readyState === 1;

// Allowed request transitions
const ALLOWED_REQUEST_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED', 'WITHDRAWN'],
  ACCEPTED: ['REFERRED', 'CLOSED'],
  REFERRED: ['COMPLETED', 'CLOSED'],
  REJECTED: [],
  WITHDRAWN: [],
  COMPLETED: [],
  CLOSED: [],
};

// Initial seeded demo referral opportunities
const INITIAL_DEMO_REFERRALS = [
  {
    _id: 'ref_google_swe',
    alumniId: 'demo_alumni', // Priya Sharma @ Google
    title: 'Software Engineer II (Backend / Distributed Systems)',
    companyName: 'Google',
    companyLogo: '',
    companyWebsite: 'https://careers.google.com',
    jobUrl: 'https://careers.google.com/jobs/results/1234567-swe2',
    role: 'Software Engineer II',
    department: 'Google Cloud & Distributed Systems',
    industry: 'Technology',
    workMode: 'Hybrid',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Full-time',
    experienceRequired: 1,
    salaryOrPackage: '32-45 LPA',
    description:
      'Looking to refer motivated campus graduates with strong algorithmic thinking and backend foundations to Google Cloud infrastructure teams. You will work on massive scale distributed storage and microservices.',
    requiredSkills: ['Java', 'Distributed Systems', 'Data Structures', 'Algorithms'],
    preferredSkills: ['Go', 'System Design', 'Cloud Architecture'],
    referralInstructions:
      'Please attach an updated resume. In your request note, highlight any open source contributions, LeetCode profile, or backend projects.',
    referralAvailable: true,
    maximumRequests: 10,
    applicationDeadline: new Date(Date.now() + 86400000 * 45), // 45 days from now
    status: 'OPEN',
    createdAt: new Date(Date.now() - 86400000 * 5),
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    _id: 'ref_msft_azure',
    alumniId: 'alumni_microsoft', // Rohan Verma @ Microsoft
    title: 'Azure Cloud Platform Engineer',
    companyName: 'Microsoft',
    companyLogo: '',
    companyWebsite: 'https://careers.microsoft.com',
    jobUrl: 'https://careers.microsoft.com/us/en/job/9876543-azure-engineer',
    role: 'Software Engineer',
    department: 'Azure Core Infrastructure',
    industry: 'Technology',
    workMode: 'Hybrid',
    location: 'Hyderabad, Telangana',
    employmentType: 'Full-time',
    experienceRequired: 0,
    salaryOrPackage: '25-35 LPA',
    description:
      'Open referral for 2026/2025 graduates interested in cloud engineering and virtualization at Microsoft Azure Core. Strong foundations in C++, C# or TypeScript are desired.',
    requiredSkills: ['C++', 'TypeScript', 'Data Structures', 'Algorithms'],
    preferredSkills: ['Azure', 'Operating Systems', 'Microservices'],
    referralInstructions:
      'Ensure your resume has high-impact project bullet points and links to active GitHub repositories.',
    referralAvailable: true,
    maximumRequests: 8,
    applicationDeadline: new Date(Date.now() + 86400000 * 30), // 30 days from now
    status: 'OPEN',
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    _id: 'ref_amzn_sde',
    alumniId: 'alumni_amazon', // Ananya Patel @ Amazon
    title: 'Full Stack SDE - Retail Platform',
    companyName: 'Amazon',
    companyLogo: '',
    companyWebsite: 'https://amazon.jobs',
    jobUrl: 'https://amazon.jobs/en/jobs/2345678-sde1-retail',
    role: 'Software Development Engineer I',
    department: 'Consumer Retail Systems',
    industry: 'E-commerce',
    workMode: 'Onsite',
    location: 'Bengaluru, Karnataka',
    employmentType: 'Full-time',
    experienceRequired: 0,
    salaryOrPackage: '28-40 LPA',
    description:
      'Happy to refer campus graduates with clean code hygiene and solid JavaScript / React / Node.js fundamentals to Amazon Retail engineering teams.',
    requiredSkills: ['React', 'JavaScript', 'Node.js', 'Data Structures'],
    preferredSkills: ['AWS', 'SQL', 'TypeScript'],
    referralInstructions:
      'Mention your key full-stack web applications and any competitive programming ratings in your note.',
    referralAvailable: true,
    maximumRequests: 5,
    applicationDeadline: new Date(Date.now() + 86400000 * 20),
    status: 'OPEN',
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
];

const memoryReferralOpportunities = JSON.parse(JSON.stringify(INITIAL_DEMO_REFERRALS));

let REFERRAL_REQUESTS_SEED = [];
try {
  REFERRAL_REQUESTS_SEED = require('../seed/seedData').REFERRAL_REQUESTS_SEED;
} catch {}

const memoryReferralRequests = (REFERRAL_REQUESTS_SEED && REFERRAL_REQUESTS_SEED.length > 0)
  ? REFERRAL_REQUESTS_SEED.map((r, idx) => ({
      _id: `mem_ref_req_${idx + 1}`,
      studentId: r.studentKey,
      referralOpportunityId: r.refOppKey,
      alumniId: r.alumniKey,
      resumeUrl: 'https://res.cloudinary.com/careerbridge/raw/upload/v1728000000/resumes/referral_resume.pdf',
      requestMessage: r.requestMessage,
      status: r.status,
      alumniResponse: r.alumniResponse || '',
      outcome: r.outcome || 'PENDING',
      outcomeNote: r.outcomeNote || '',
      requestedAt: new Date(Date.now() - 86400000 * 5),
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(),
    }))
  : [];

/**
 * Deterministic Profile Matching Engine for Referrals
 * Calculates matchScore (50-98%) based on skills & preferences (STRICTLY NO AI)
 */
const calculateReferralMatch = (studentProfile, referral) => {
  if (!studentProfile || !referral) {
    return {
      matchScore: 60,
      matchLabel: 'Profile Match',
      matchReasons: ['Alumni from your institution'],
    };
  }

  let score = 50;
  const reasons = [];

  const studentSkills = (studentProfile.skills || []).map((s) => s.toLowerCase().trim());
  const reqSkills = (referral.requiredSkills || []).map((s) => s.toLowerCase().trim());
  const prefSkills = (referral.preferredSkills || []).map((s) => s.toLowerCase().trim());
  const studentRoles = (studentProfile.preferredRoles || []).map((r) => r.toLowerCase().trim());
  const studentIndustries = (studentProfile.preferredIndustries || []).map((i) => i.toLowerCase().trim());

  // 1. Required Skills Overlap (Weight: up to +30)
  const matchedRequired = reqSkills.filter((s) => studentSkills.includes(s));
  if (matchedRequired.length > 0) {
    const boost = Math.min(30, matchedRequired.length * 10);
    score += boost;
    const sample = matchedRequired.slice(0, 3).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
    reasons.push(`Matches required skills: ${sample.join(', ')}`);
  }

  // 2. Preferred Skills Overlap (Weight: up to +15)
  const matchedPreferred = prefSkills.filter((s) => studentSkills.includes(s));
  if (matchedPreferred.length > 0) {
    const boost = Math.min(15, matchedPreferred.length * 8);
    score += boost;
    const sample = matchedPreferred.slice(0, 2).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
    reasons.push(`Matches bonus skills: ${sample.join(', ')}`);
  }

  // 3. Role Alignment (Weight: +10)
  const refRole = (referral.role || '').toLowerCase();
  const roleMatch = studentRoles.find((r) => refRole.includes(r) || r.includes(refRole));
  if (roleMatch && referral.role) {
    score += 10;
    reasons.push(`Role aligns with your interest in ${referral.role}`);
  }

  // 4. Industry Alignment (Weight: +8)
  const refInd = (referral.industry || '').toLowerCase();
  const indMatch = studentIndustries.find((i) => refInd.includes(i) || i.includes(refInd));
  if (indMatch && referral.industry) {
    score += 8;
    reasons.push(`Industry matches your preferred sector: ${referral.industry}`);
  }

  const finalScore = Math.min(98, Math.max(55, Math.round(score)));
  if (reasons.length === 0) {
    reasons.push('Opportunity from verified alumnus open to referring motivated campus students');
  }

  return {
    matchScore: finalScore,
    matchLabel: 'Profile Match',
    matchReasons: reasons,
  };
};

/**
 * Validate that user is a verified alumnus
 */
const verifyAlumniStatus = async (userId) => {
  const profile = await findAlumniProfile(userId);
  if (!profile) {
    throw new NotFoundError('Alumni profile not found. Please create your profile first.');
  }
  if (profile.verificationStatus !== 'VERIFIED') {
    throw new ForbiddenError('Only verified alumni can create and manage referral opportunities.');
  }
  return profile;
};

/**
 * Query open referral opportunities for student discovery
 */
const discoverReferralOpportunities = async ({
  studentUserId = null,
  search = '',
  company = '',
  industry = '',
  workMode = '',
  location = '',
  skill = '',
  sort = 'recommended',
}) => {
  let list = [];

  if (isDbConnected()) {
    try {
      const query = {
        status: 'OPEN',
        referralAvailable: true,
        applicationDeadline: { $gte: new Date() },
      };
      const docs = await ReferralOpportunity.find(query).lean();
      if (docs && docs.length > 0) list = docs;
    } catch (e) {
      console.warn('DB error in referral discover, fallback to memory:', e.message);
      list = memoryReferralOpportunities;
    }
  } else {
    list = memoryReferralOpportunities;
  }

  // Filter open, available, and active deadline
  const now = Date.now();
  list = list.filter(
    (r) =>
      r.status === 'OPEN' &&
      r.referralAvailable === true &&
      new Date(r.applicationDeadline).getTime() >= now
  );

  let studentProfile = null;
  if (studentUserId) {
    studentProfile = await findStudentProfile(studentUserId);
  }

  // Populate alumni details & calculate profile match
  let decorated = await Promise.all(
    list.map(async (r) => {
      const alumniProfile = await findAlumniProfile(r.alumniId);
      const match = calculateReferralMatch(studentProfile, r);

      return {
        ...r,
        id: r._id || r.id,
        matchScore: match.matchScore,
        matchLabel: match.matchLabel,
        matchReasons: match.matchReasons,
        alumni: {
          id: alumniProfile?.userId || r.alumniId,
          fullName: alumniProfile?.fullName || 'Verified Alumnus',
          currentCompany: alumniProfile?.currentCompany,
          currentRole: alumniProfile?.currentRole,
          department: alumniProfile?.department,
          graduationYear: alumniProfile?.graduationYear,
          yearsOfExperience: alumniProfile?.yearsOfExperience || 0,
          profilePhoto: alumniProfile?.profilePhoto || null,
        },
      };
    })
  );

  // Search filter
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    decorated = decorated.filter((r) => {
      const t = (r.title || '').toLowerCase();
      const c = (r.companyName || '').toLowerCase();
      const ro = (r.role || '').toLowerCase();
      const ind = (r.industry || '').toLowerCase();
      const sk = (r.requiredSkills || []).concat(r.preferredSkills || []).map((s) => s.toLowerCase());
      return (
        t.includes(q) ||
        c.includes(q) ||
        ro.includes(q) ||
        ind.includes(q) ||
        sk.some((s) => s.includes(q))
      );
    });
  }

  // Granular filters
  if (company.trim()) {
    const cq = company.toLowerCase().trim();
    decorated = decorated.filter((r) => (r.companyName || '').toLowerCase().includes(cq));
  }
  if (industry.trim()) {
    const iq = industry.toLowerCase().trim();
    decorated = decorated.filter((r) => (r.industry || '').toLowerCase().includes(iq));
  }
  if (workMode.trim()) {
    decorated = decorated.filter((r) => (r.workMode || '').toLowerCase() === workMode.toLowerCase());
  }
  if (location.trim()) {
    const lq = location.toLowerCase().trim();
    decorated = decorated.filter((r) => (r.location || '').toLowerCase().includes(lq));
  }
  if (skill.trim()) {
    const sq = skill.toLowerCase().trim();
    decorated = decorated.filter((r) =>
      (r.requiredSkills || []).concat(r.preferredSkills || []).some((s) => s.toLowerCase().includes(sq))
    );
  }

  // Sorting
  if (sort === 'newest') {
    decorated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'deadline') {
    decorated.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
  } else if (sort === 'company') {
    decorated.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || ''));
  } else {
    // Default: 'recommended' by profile matchScore
    decorated.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  return {
    referrals: decorated,
    total: decorated.length,
    hasStudentProfile: Boolean(studentProfile && (studentProfile.skills || []).length > 0),
  };
};

/**
 * Get single referral opportunity by ID
 */
const getReferralOpportunityById = async (id, studentUserId = null) => {
  const strId = String(id);
  let referral = null;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(strId)) {
    try {
      referral = await ReferralOpportunity.findById(strId).lean();
    } catch (e) {
      console.warn('DB error getting referral by ID:', e.message);
    }
  }

  if (!referral) {
    referral = memoryReferralOpportunities.find((r) => String(r._id || r.id) === strId) || null;
  }

  if (!referral) {
    throw new NotFoundError('Referral opportunity not found.');
  }

  const alumniProfile = await findAlumniProfile(referral.alumniId);
  let match = { matchScore: 60, matchLabel: 'Profile Match', matchReasons: [] };
  let existingRequest = null;

  if (studentUserId) {
    const studentProfile = await findStudentProfile(studentUserId);
    match = calculateReferralMatch(studentProfile, referral);
    existingRequest = await findStudentRequestForOpportunity(studentUserId, strId);
  }

  // Count active requests
  const activeCount = await countActiveRequestsForOpportunity(strId);

  return {
    ...referral,
    id: referral._id || referral.id,
    matchScore: match.matchScore,
    matchLabel: match.matchLabel,
    matchReasons: match.matchReasons,
    activeRequestsCount: activeCount,
    isCapacityReached: referral.maximumRequests ? activeCount >= referral.maximumRequests : false,
    existingRequest,
    alumni: {
      id: alumniProfile?.userId || referral.alumniId,
      fullName: alumniProfile?.fullName || 'Verified Alumnus',
      currentCompany: alumniProfile?.currentCompany,
      currentRole: alumniProfile?.currentRole,
      department: alumniProfile?.department,
      graduationYear: alumniProfile?.graduationYear,
      yearsOfExperience: alumniProfile?.yearsOfExperience || 0,
      profilePhoto: alumniProfile?.profilePhoto || null,
      bio: alumniProfile?.bio || '',
      verificationStatus: alumniProfile?.verificationStatus,
    },
  };
};

/**
 * Create a new Referral Opportunity (Verified Alumni only)
 */
const createReferralOpportunity = async (alumniUserId, data) => {
  await verifyAlumniStatus(alumniUserId);

  if (!data.title || !data.companyName || !data.role || !data.location || !data.description) {
    throw new BadRequestError('Please provide all required referral opportunity fields (title, companyName, role, location, description).');
  }

  let deadline = null;
  if (data.applicationDeadline) {
    deadline = new Date(data.applicationDeadline);
    if (isNaN(deadline.getTime())) {
      throw new BadRequestError('Please provide a valid application deadline date.');
    }
  } else {
    deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const normalizeWorkMode = (mode) => {
    if (!mode) return 'Hybrid';
    const m = String(mode).toLowerCase();
    if (m === 'remote') return 'Remote';
    if (m === 'onsite') return 'Onsite';
    return 'Hybrid';
  };

  const normalizeEmploymentType = (type) => {
    if (!type) return 'Full-time';
    const t = String(type).toLowerCase().replace('-', '_');
    if (t === 'internship') return 'Internship';
    if (t === 'part_time') return 'Part-time';
    if (t === 'contract') return 'Contract';
    return 'Full-time';
  };

  const newDoc = {
    _id: isDbConnected() ? new mongoose.Types.ObjectId() : 'ref_' + Date.now(),
    alumniId: String(alumniUserId),
    title: data.title.trim(),
    companyName: data.companyName.trim(),
    companyLogo: data.companyLogo || '',
    companyWebsite: data.companyWebsite || '',
    jobUrl: data.jobUrl || '',
    role: data.role.trim(),
    department: data.department || '',
    industry: data.industry || 'Technology',
    workMode: normalizeWorkMode(data.workMode),
    location: data.location.trim(),
    employmentType: normalizeEmploymentType(data.employmentType),
    experienceRequired: Number(data.experienceRequired) || 0,
    salaryOrPackage: data.salaryOrPackage || '',
    description: data.description.trim(),
    requiredSkills: Array.isArray(data.requiredSkills)
      ? data.requiredSkills
      : (data.requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
    preferredSkills: Array.isArray(data.preferredSkills)
      ? data.preferredSkills
      : (data.preferredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
    referralInstructions: data.referralInstructions || '',
    referralAvailable: data.referralAvailable !== false,
    maximumRequests: data.maximumRequests ? Number(data.maximumRequests) : null,
    applicationDeadline: deadline,
    status: data.status || 'OPEN',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (isDbConnected()) {
    try {
      const created = await ReferralOpportunity.create(newDoc);
      return created.toObject();
    } catch (e) {
      console.warn('DB create error for referral opportunity, using memory store:', e.message);
    }
  }

  memoryReferralOpportunities.unshift(newDoc);
  return newDoc;
};

/**
 * Update Referral Opportunity (Owner Alumni only)
 */
const updateReferralOpportunity = async (id, alumniUserId, data) => {
  await verifyAlumniStatus(alumniUserId);
  const strId = String(id);
  const referral = await getRawReferralById(strId);

  if (!referral) {
    throw new NotFoundError('Referral opportunity not found.');
  }

  if (String(referral.alumniId) !== String(alumniUserId)) {
    throw new ForbiddenError('You can only update referral opportunities that you created.');
  }

  const updates = { ...data, updatedAt: new Date() };
  delete updates._id;
  delete updates.alumniId;

  if (updates.applicationDeadline) {
    const d = new Date(updates.applicationDeadline);
    if (!isNaN(d.getTime())) updates.applicationDeadline = d;
  }
  if (updates.requiredSkills && typeof updates.requiredSkills === 'string') {
    updates.requiredSkills = updates.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (updates.preferredSkills && typeof updates.preferredSkills === 'string') {
    updates.preferredSkills = updates.preferredSkills.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(referral._id)) {
    try {
      const updated = await ReferralOpportunity.findByIdAndUpdate(referral._id, updates, {
        new: true,
      }).lean();
      return updated;
    } catch (e) {
      console.warn('DB error updating referral, using memory store:', e.message);
    }
  }

  Object.assign(referral, updates);
  return referral;
};

/**
 * Update Referral Opportunity Status (Owner Alumni only)
 */
const updateReferralOpportunityStatus = async (id, alumniUserId, status) => {
  if (!['DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED'].includes(status)) {
    throw new BadRequestError('Invalid referral opportunity status.');
  }
  return await updateReferralOpportunity(id, alumniUserId, { status });
};

/**
 * Get all referral opportunities created by an Alumni
 */
const getAlumniReferralOpportunities = async (alumniUserId) => {
  const strAlumni = String(alumniUserId);
  let list = [];

  if (isDbConnected()) {
    try {
      list = await ReferralOpportunity.find({ alumniId: strAlumni })
        .sort({ createdAt: -1 })
        .lean();
    } catch (e) {
      console.warn('DB error fetching alumni referral opportunities:', e.message);
      list = memoryReferralOpportunities.filter((r) => String(r.alumniId) === strAlumni);
    }
  } else {
    list = memoryReferralOpportunities.filter((r) => String(r.alumniId) === strAlumni);
  }

  // Augment with request counts
  const decorated = await Promise.all(
    list.map(async (r) => {
      const rid = String(r._id || r.id);
      const reqs = await getRequestsForOpportunityRaw(rid);
      const pending = reqs.filter((rq) => rq.status === 'PENDING').length;
      const accepted = reqs.filter((rq) => rq.status === 'ACCEPTED').length;
      const referred = reqs.filter((rq) => rq.status === 'REFERRED').length;
      const completed = reqs.filter((rq) => rq.status === 'COMPLETED').length;

      return {
        ...r,
        id: rid,
        totalRequests: reqs.length,
        pendingRequests: pending,
        acceptedRequests: accepted,
        referredRequests: referred,
        completedRequests: completed,
      };
    })
  );

  return decorated;
};

/**
 * Submit a Referral Request (Student)
 */
const submitReferralRequest = async (studentUserId, opportunityId, { requestMessage = '', resumeUrl: customResumeUrl = '' }) => {
  const strStudent = String(studentUserId);
  const strOpp = String(opportunityId);

  const referral = await getRawReferralById(strOpp);
  if (!referral) {
    throw new NotFoundError('Referral opportunity not found.');
  }

  if (String(referral.alumniId) === strStudent) {
    throw new BadRequestError('You cannot request a referral from yourself.');
  }

  if (referral.status !== 'OPEN') {
    throw new BadRequestError('This referral opportunity is currently not open for requests.');
  }

  if (referral.referralAvailable === false) {
    throw new BadRequestError('This referral is currently unavailable.');
  }

  if (new Date(referral.applicationDeadline).getTime() < Date.now()) {
    throw new BadRequestError('The application deadline for this referral opportunity has passed.');
  }

  // Verify student profile and resume snapshot
  const studentProfile = await findStudentProfile(strStudent);
  let resumeUrl = customResumeUrl || studentProfile?.resume?.url || studentProfile?.resumeUrl;
  if (!resumeUrl) {
    resumeUrl = 'https://example.com/resumes/demo-student-resume.pdf';
  }

  // Duplicate active request check: PENDING, ACCEPTED, or REFERRED
  const existingActive = await findActiveStudentRequest(strStudent, strOpp);
  if (existingActive) {
    throw new BadRequestError(
      `You already have an active referral request (Status: ${existingActive.status}) for this opportunity.`
    );
  }

  // Capacity check
  if (referral.maximumRequests) {
    const currentAccepted = await countActiveRequestsForOpportunity(strOpp);
    if (currentAccepted >= referral.maximumRequests) {
      throw new BadRequestError('This referral opportunity has reached its maximum request capacity.');
    }
  }

  const newRequest = {
    _id: isDbConnected() ? new mongoose.Types.ObjectId() : 'req_' + Date.now(),
    studentId: strStudent,
    referralOpportunityId: strOpp,
    alumniId: String(referral.alumniId),
    resumeUrl,
    requestMessage: (requestMessage || '').trim(),
    status: 'PENDING',
    alumniResponse: '',
    requestedAt: new Date(),
    outcome: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (isDbConnected()) {
    try {
      const created = await ReferralRequest.create(newRequest);
      return created.toObject();
    } catch (e) {
      console.warn('DB error creating referral request, using memory store:', e.message);
    }
  }

  memoryReferralRequests.unshift(newRequest);
  return newRequest;
};

/**
 * Get student's referral requests with opportunity & alumni details
 */
const getStudentReferralRequests = async (studentUserId) => {
  const strStudent = String(studentUserId);
  let list = [];

  if (isDbConnected()) {
    try {
      list = await ReferralRequest.find({ studentId: strStudent })
        .sort({ createdAt: -1 })
        .lean();
    } catch (e) {
      console.warn('DB error fetching student requests:', e.message);
      list = memoryReferralRequests.filter((rq) => String(rq.studentId) === strStudent);
    }
  } else {
    list = memoryReferralRequests.filter((rq) => String(rq.studentId) === strStudent);
  }

  const decorated = await Promise.all(
    list.map(async (rq) => {
      const opp = await getRawReferralById(rq.referralOpportunityId);
      const alumniProfile = await findAlumniProfile(rq.alumniId);

      return {
        ...rq,
        id: rq._id || rq.id,
        opportunity: opp
          ? {
              id: opp._id || opp.id,
              title: opp.title,
              companyName: opp.companyName,
              role: opp.role,
              location: opp.location,
              workMode: opp.workMode,
              jobUrl: opp.jobUrl,
              applicationDeadline: opp.applicationDeadline,
              status: opp.status,
            }
          : null,
        alumni: {
          id: alumniProfile?.userId || rq.alumniId,
          fullName: alumniProfile?.fullName || 'Alumnus',
          currentCompany: alumniProfile?.currentCompany,
          currentRole: alumniProfile?.currentRole,
          department: alumniProfile?.department,
          graduationYear: alumniProfile?.graduationYear,
        },
      };
    })
  );

  return decorated;
};

/**
 * Get all requests for a specific Referral Opportunity (Alumni Owner)
 */
const getOpportunityRequestsForAlumni = async (opportunityId, alumniUserId) => {
  const strOpp = String(opportunityId);
  const strAlumni = String(alumniUserId);

  const referral = await getRawReferralById(strOpp);
  if (!referral) {
    throw new NotFoundError('Referral opportunity not found.');
  }

  if (String(referral.alumniId) !== strAlumni) {
    throw new ForbiddenError('You can only view requests for your own referral opportunities.');
  }

  const reqs = await getRequestsForOpportunityRaw(strOpp);

  const decorated = await Promise.all(
    reqs.map(async (rq) => {
      const studentProfile = await findStudentProfile(rq.studentId);
      const studentUser = await findUserById(rq.studentId);

      return {
        ...rq,
        id: rq._id || rq.id,
        student: {
          id: rq.studentId,
          fullName: studentProfile?.fullName || studentUser?.name || 'Student Candidate',
          email: studentUser?.email,
          department: studentProfile?.department || 'N/A',
          college: studentProfile?.college || 'CareerBridge',
          graduationYear: studentProfile?.graduationYear || 2026,
          skills: studentProfile?.skills || [],
          careerInterests: studentProfile?.careerInterests || [],
          projects: (studentProfile?.projects || []).slice(0, 3),
          resumeUrl: rq.resumeUrl,
        },
      };
    })
  );

  return decorated;
};

/**
 * Get all incoming requests across all opportunities for Alumni
 */
const getAllIncomingRequestsForAlumni = async (alumniUserId) => {
  const strAlumni = String(alumniUserId);
  let list = [];

  if (isDbConnected()) {
    try {
      list = await ReferralRequest.find({ alumniId: strAlumni })
        .sort({ createdAt: -1 })
        .lean();
    } catch (e) {
      console.warn('DB error fetching all alumni requests:', e.message);
      list = memoryReferralRequests.filter((rq) => String(rq.alumniId) === strAlumni);
    }
  } else {
    list = memoryReferralRequests.filter((rq) => String(rq.alumniId) === strAlumni);
  }

  const decorated = await Promise.all(
    list.map(async (rq) => {
      const opp = await getRawReferralById(rq.referralOpportunityId);
      const studentProfile = await findStudentProfile(rq.studentId);
      const studentUser = await findUserById(rq.studentId);

      return {
        ...rq,
        id: rq._id || rq.id,
        opportunity: opp
          ? {
              id: opp._id || opp.id,
              title: opp.title,
              companyName: opp.companyName,
              role: opp.role,
              location: opp.location,
              status: opp.status,
            }
          : null,
        student: {
          id: rq.studentId,
          fullName: studentProfile?.fullName || studentUser?.name || 'Student Candidate',
          email: studentUser?.email,
          department: studentProfile?.department || 'N/A',
          graduationYear: studentProfile?.graduationYear || 2026,
          skills: studentProfile?.skills || [],
          resumeUrl: rq.resumeUrl,
        },
      };
    })
  );

  return decorated;
};

/**
 * Accept a Referral Request (Alumni)
 */
const acceptReferralRequest = async (requestId, alumniUserId, { responseMessage = '' } = {}) => {
  const req = await getRawRequestById(requestId);
  if (!req) throw new NotFoundError('Referral request not found.');

  if (String(req.alumniId) !== String(alumniUserId)) {
    throw new ForbiddenError('You can only accept requests addressed to you.');
  }

  validateRequestTransition(req.status, 'ACCEPTED');

  const updates = {
    status: 'ACCEPTED',
    respondedAt: new Date(),
    alumniResponse: (responseMessage || '').trim(),
    updatedAt: new Date(),
  };

  return await saveRequestUpdates(req, updates);
};

/**
 * Reject a Referral Request (Alumni)
 */
const rejectReferralRequest = async (requestId, alumniUserId, { responseMessage = '' } = {}) => {
  const req = await getRawRequestById(requestId);
  if (!req) throw new NotFoundError('Referral request not found.');

  if (String(req.alumniId) !== String(alumniUserId)) {
    throw new ForbiddenError('You can only reject requests addressed to you.');
  }

  validateRequestTransition(req.status, 'REJECTED');

  const updates = {
    status: 'REJECTED',
    respondedAt: new Date(),
    outcome: 'NOT_SELECTED',
    alumniResponse: (responseMessage || '').trim(),
    updatedAt: new Date(),
  };

  return await saveRequestUpdates(req, updates);
};

/**
 * Withdraw a Referral Request (Student)
 */
const withdrawReferralRequest = async (requestId, studentUserId) => {
  const req = await getRawRequestById(requestId);
  if (!req) throw new NotFoundError('Referral request not found.');

  if (String(req.studentId) !== String(studentUserId)) {
    throw new ForbiddenError('You can only withdraw your own referral request.');
  }

  validateRequestTransition(req.status, 'WITHDRAWN');

  const updates = {
    status: 'WITHDRAWN',
    outcome: 'WITHDRAWN',
    updatedAt: new Date(),
  };

  return await saveRequestUpdates(req, updates);
};

/**
 * Mark a Referral Request as REFERRED (Alumni confirms submission)
 */
const markRequestAsReferred = async (requestId, alumniUserId, { responseMessage = '' } = {}) => {
  const req = await getRawRequestById(requestId);
  if (!req) throw new NotFoundError('Referral request not found.');

  if (String(req.alumniId) !== String(alumniUserId)) {
    throw new ForbiddenError('You can only mark referrals that you accepted.');
  }

  validateRequestTransition(req.status, 'REFERRED');

  const updates = {
    status: 'REFERRED',
    referredAt: new Date(),
    alumniResponse: responseMessage ? responseMessage.trim() : req.alumniResponse,
    updatedAt: new Date(),
  };

  return await saveRequestUpdates(req, updates);
};

/**
 * Complete a Referral Request (Participant)
 */
const completeReferralRequest = async (requestId, userId) => {
  const req = await getRawRequestById(requestId);
  if (!req) throw new NotFoundError('Referral request not found.');

  const isStudent = String(req.studentId) === String(userId);
  const isAlumni = String(req.alumniId) === String(userId);

  if (!isStudent && !isAlumni) {
    throw new ForbiddenError('You are not a participant in this referral request.');
  }

  validateRequestTransition(req.status, 'COMPLETED');

  const updates = {
    status: 'COMPLETED',
    updatedAt: new Date(),
  };

  return await saveRequestUpdates(req, updates);
};

/**
 * Update Referral Outcome (Student or Alumni)
 */
const updateReferralOutcome = async (requestId, userId, { outcome, outcomeNote = '' }) => {
  const req = await getRawRequestById(requestId);
  if (!req) throw new NotFoundError('Referral request not found.');

  const isStudent = String(req.studentId) === String(userId);
  const isAlumni = String(req.alumniId) === String(userId);

  if (!isStudent && !isAlumni) {
    throw new ForbiddenError('You are not a participant in this referral request.');
  }

  const validOutcomes = ['PENDING', 'INTERVIEW', 'SELECTED', 'NOT_SELECTED', 'NO_RESPONSE', 'WITHDRAWN', 'OTHER'];
  if (!validOutcomes.includes(outcome)) {
    throw new BadRequestError('Invalid referral outcome specified.');
  }

  const updates = {
    outcome,
    outcomeNote: outcomeNote.trim(),
    updatedAt: new Date(),
  };

  return await saveRequestUpdates(req, updates);
};

// --- Helper Functions ---

const validateRequestTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_REQUEST_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new BadRequestError(
      `Invalid referral request status transition from '${currentStatus}' to '${targetStatus}'. Allowed transitions: ${
        allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)'
      }`
    );
  }
};

const getRawReferralById = async (id) => {
  const strId = String(id);
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(strId)) {
    try {
      const doc = await ReferralOpportunity.findById(strId).lean();
      if (doc) return doc;
    } catch {}
  }
  return memoryReferralOpportunities.find((r) => String(r._id || r.id) === strId) || null;
};

const getRawRequestById = async (id) => {
  const strId = String(id);
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(strId)) {
    try {
      const doc = await ReferralRequest.findById(strId).lean();
      if (doc) return doc;
    } catch {}
  }
  return memoryReferralRequests.find((rq) => String(rq._id || rq.id) === strId) || null;
};

const saveRequestUpdates = async (req, updates) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(req._id)) {
    const updated = await ReferralRequest.findByIdAndUpdate(req._id, updates, { new: true }).lean();
    return updated;
  }
  Object.assign(req, updates);
  return req;
};

const findActiveStudentRequest = async (studentId, oppId) => {
  const activeStatuses = ['PENDING', 'ACCEPTED', 'REFERRED'];
  if (isDbConnected()) {
    try {
      const doc = await ReferralRequest.findOne({
        studentId,
        referralOpportunityId: oppId,
        status: { $in: activeStatuses },
      }).lean();
      if (doc) return doc;
    } catch {}
  }
  return (
    memoryReferralRequests.find(
      (rq) =>
        String(rq.studentId) === String(studentId) &&
        String(rq.referralOpportunityId) === String(oppId) &&
        activeStatuses.includes(rq.status)
    ) || null
  );
};

const findStudentRequestForOpportunity = async (studentId, oppId) => {
  if (isDbConnected()) {
    try {
      const doc = await ReferralRequest.findOne({
        studentId,
        referralOpportunityId: oppId,
      })
        .sort({ createdAt: -1 })
        .lean();
      if (doc) return doc;
    } catch {}
  }
  return (
    memoryReferralRequests
      .filter(
        (rq) =>
          String(rq.studentId) === String(studentId) &&
          String(rq.referralOpportunityId) === String(oppId)
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
  );
};

const countActiveRequestsForOpportunity = async (oppId) => {
  const activeStatuses = ['ACCEPTED', 'REFERRED'];
  if (isDbConnected()) {
    try {
      return await ReferralRequest.countDocuments({
        referralOpportunityId: oppId,
        status: { $in: activeStatuses },
      });
    } catch {}
  }
  return memoryReferralRequests.filter(
    (rq) => String(rq.referralOpportunityId) === String(oppId) && activeStatuses.includes(rq.status)
  ).length;
};

const getRequestsForOpportunityRaw = async (oppId) => {
  if (isDbConnected()) {
    try {
      return await ReferralRequest.find({ referralOpportunityId: oppId })
        .sort({ createdAt: -1 })
        .lean();
    } catch {}
  }
  return memoryReferralRequests.filter((rq) => String(rq.referralOpportunityId) === String(oppId));
};

module.exports = {
  discoverReferralOpportunities,
  getReferralOpportunityById,
  createReferralOpportunity,
  updateReferralOpportunity,
  updateReferralOpportunityStatus,
  getAlumniReferralOpportunities,
  submitReferralRequest,
  getStudentReferralRequests,
  getOpportunityRequestsForAlumni,
  getAllIncomingRequestsForAlumni,
  acceptReferralRequest,
  rejectReferralRequest,
  withdrawReferralRequest,
  markRequestAsReferred,
  completeReferralRequest,
  updateReferralOutcome,
  calculateReferralMatch,
  ALLOWED_REQUEST_TRANSITIONS,
  memoryReferralOpportunities,
  memoryReferralRequests,
};
