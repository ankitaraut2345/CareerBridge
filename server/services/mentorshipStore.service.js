const mongoose = require('mongoose');
const Mentorship = require('../models/Mentorship.model');
const {
  findProfileByUserId: findAlumniProfile,
  getVerifiedMentors,
} = require('./alumniProfileStore.service');
const {
  findProfileByUserId: findStudentProfile,
} = require('./studentProfileStore.service');
const { findUserById } = require('./userStore.service');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/error');

const isDbConnected = () => mongoose.connection.readyState === 1;

let MENTORSHIPS_SEED = [];
try {
  MENTORSHIPS_SEED = require('../seed/seedData').MENTORSHIPS_SEED;
} catch {}

const memoryMentorships = (MENTORSHIPS_SEED && MENTORSHIPS_SEED.length > 0)
  ? MENTORSHIPS_SEED.map((m, idx) => ({
      _id: `mem_mentorship_${idx + 1}`,
      studentId: m.studentKey,
      alumniId: m.alumniKey,
      requestedBy: 'STUDENT',
      status: m.status,
      requestMessage: m.requestMessage,
      responseMessage: m.responseMessage || '',
      mentorshipAreas: m.mentorshipAreas || [],
      startedAt: m.startedAt,
      completedAt: m.completedAt,
      rejectedAt: m.rejectedAt,
      createdAt: m.startedAt || new Date(),
      updatedAt: new Date(),
    }))
  : [];

// Allowed status transition map
const ALLOWED_MENTORSHIP_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['COMPLETED', 'CANCELLED'],
  REJECTED: [],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * Deterministic recommendation matching engine
 * Calculates a match score (0-100) and human-readable explanation
 * STRICT RULE: NOT AI matching. Deterministic profile correlation.
 */
const calculateMentorMatch = (studentProfile, alumniProfile) => {
  if (!studentProfile || !alumniProfile) {
    return {
      matchScore: 60,
      matchLabel: 'Profile Match',
      matchReasons: ['Verified alumni from your institution'],
    };
  }

  let score = 50; // baseline
  const reasons = [];

  const studentSkills = (studentProfile.skills || []).map((s) => s.toLowerCase().trim());
  const alumniSkills = (alumniProfile.skills || []).map((s) => s.toLowerCase().trim());
  const studentInterests = (studentProfile.careerInterests || []).map((i) => i.toLowerCase().trim());
  const alumniAreas = (alumniProfile.mentorshipAreas || []).map((a) => a.toLowerCase().trim());
  const studentRoles = (studentProfile.preferredRoles || []).map((r) => r.toLowerCase().trim());
  const studentIndustries = (studentProfile.preferredIndustries || []).map((i) => i.toLowerCase().trim());

  // 1. Skill Overlap (High Weight: up to +25)
  const sharedSkills = studentSkills.filter((s) => alumniSkills.includes(s));
  if (sharedSkills.length > 0) {
    const boost = Math.min(25, sharedSkills.length * 8);
    score += boost;
    const sample = sharedSkills.slice(0, 3).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
    reasons.push(`Shared skills: ${sample.join(', ')}`);
  }

  // 2. Mentorship Areas ↔ Career Interests / Skills (High Weight: up to +20)
  const matchingAreas = alumniAreas.filter((area) =>
    studentInterests.some((interest) => area.includes(interest) || interest.includes(area)) ||
    studentSkills.some((skill) => area.includes(skill) || skill.includes(area))
  );
  if (matchingAreas.length > 0) {
    const boost = Math.min(20, matchingAreas.length * 10);
    score += boost;
    const sample = matchingAreas.slice(0, 2).map((a) => a.charAt(0).toUpperCase() + a.slice(1));
    reasons.push(`Offers mentorship in: ${sample.join(', ')}`);
  }

  // 3. Current Role ↔ Preferred Roles (Medium Weight: up to +15)
  const alumniRole = (alumniProfile.currentRole || '').toLowerCase();
  const roleMatch = studentRoles.find((r) => alumniRole.includes(r) || r.includes(alumniRole));
  if (roleMatch && alumniRole) {
    score += 15;
    reasons.push(`Currently working as ${alumniProfile.currentRole}`);
  }

  // 4. Industry Match (Medium Weight: +10)
  const alumniIndustry = (alumniProfile.industry || '').toLowerCase();
  const industryMatch = studentIndustries.find((i) => alumniIndustry.includes(i) || i.includes(alumniIndustry));
  if (industryMatch && alumniProfile.industry) {
    score += 10;
    reasons.push(`Industry alignment in ${alumniProfile.industry}`);
  }

  // 5. Department / Campus Heritage (+5)
  if (
    studentProfile.department &&
    alumniProfile.department &&
    studentProfile.department.toLowerCase() === alumniProfile.department.toLowerCase()
  ) {
    score += 5;
    reasons.push(`Alumnus from ${alumniProfile.department} department`);
  }

  // Clamp score between 55 and 98
  const finalScore = Math.min(98, Math.max(55, Math.round(score)));

  if (reasons.length === 0) {
    reasons.push('Experienced alumnus available for career and interview guidance');
  }

  return {
    matchScore: finalScore,
    matchLabel: 'Profile Match',
    matchReasons: reasons,
  };
};

/**
 * Sanitize public alumni profile for student view (Privacy preservation)
 */
const sanitizeMentorPublicProfile = (alumniProfile) => {
  if (!alumniProfile) return null;
  return {
    id: alumniProfile.userId || alumniProfile._id,
    userId: alumniProfile.userId || alumniProfile._id,
    name: alumniProfile.fullName,
    fullName: alumniProfile.fullName,
    profilePhoto: alumniProfile.profilePhoto || null,
    company: alumniProfile.currentCompany || 'Not Specified',
    currentCompany: alumniProfile.currentCompany || 'Not Specified',
    currentRole: alumniProfile.currentRole || 'Alumnus',
    industry: alumniProfile.industry || 'Technology',
    yearsOfExperience: alumniProfile.yearsOfExperience || 0,
    graduationYear: alumniProfile.graduationYear,
    department: alumniProfile.department,
    college: alumniProfile.college,
    location: alumniProfile.location || 'India',
    bio: alumniProfile.bio || '',
    skills: alumniProfile.skills || [],
    careerInterests: alumniProfile.careerInterests || [],
    previousCompanies: alumniProfile.previousCompanies || [],
    mentorshipAvailable: alumniProfile.mentorshipAvailable === true,
    mentorshipAreas: alumniProfile.mentorshipAreas || [],
    linkedinUrl: alumniProfile.linkedinUrl || '',
    githubUrl: alumniProfile.githubUrl || '',
    verificationStatus: alumniProfile.verificationStatus,
  };
};

/**
 * Sanitize student profile for alumni request view (Privacy preservation)
 */
const sanitizeStudentMenteeProfile = (studentProfile) => {
  if (!studentProfile) return null;
  return {
    id: studentProfile.userId || studentProfile._id,
    userId: studentProfile.userId || studentProfile._id,
    fullName: studentProfile.fullName || 'Student',
    profilePhoto: studentProfile.profilePhoto || null,
    department: studentProfile.department || 'N/A',
    college: studentProfile.college || 'CareerBridge',
    graduationYear: studentProfile.graduationYear || 2026,
    skills: studentProfile.skills || [],
    careerInterests: studentProfile.careerInterests || [],
    preferredRoles: studentProfile.preferredRoles || [],
    preferredIndustries: studentProfile.preferredIndustries || [],
    bio: studentProfile.bio || '',
    projects: (studentProfile.projects || []).map((p) => ({
      title: p.title,
      description: p.description,
      technologies: p.technologies || [],
      projectUrl: p.projectUrl || '',
      githubUrl: p.githubUrl || '',
    })),
  };
};

/**
 * Discover verified mentors with search, filter, matching, and sorting
 */
const discoverMentors = async ({
  studentUserId,
  search = '',
  company = '',
  industry = '',
  department = '',
  location = '',
  graduationYear = '',
  availability = '',
  area = '',
  skill = '',
  minExp = '',
  sort = 'recommended',
}) => {
  const verifiedMentors = await getVerifiedMentors();
  let studentProfile = null;
  if (studentUserId) {
    studentProfile = await findStudentProfile(studentUserId);
  }

  // Map verified mentors with match scores
  let list = verifiedMentors.map((p) => {
    const publicProfile = sanitizeMentorPublicProfile(p);
    const match = calculateMentorMatch(studentProfile, p);
    return {
      ...publicProfile,
      matchScore: match.matchScore,
      matchLabel: match.matchLabel,
      matchReasons: match.matchReasons,
    };
  });

  // Apply Search (across name, company, role, department, location, industry, graduation year, bio, skills, guidance areas)
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    list = list.filter((m) => {
      const name = (m.fullName || '').toLowerCase();
      const comp = (m.currentCompany || '').toLowerCase();
      const role = (m.currentRole || '').toLowerCase();
      const dept = (m.department || '').toLowerCase();
      const loc = (m.location || '').toLowerCase();
      const ind = (m.industry || '').toLowerCase();
      const gradYear = String(m.graduationYear || '');
      const bio = (m.bio || '').toLowerCase();
      const skills = (m.skills || []).map((s) => s.toLowerCase());
      const areas = (m.mentorshipAreas || []).map((a) => a.toLowerCase());
      return (
        name.includes(q) ||
        comp.includes(q) ||
        role.includes(q) ||
        dept.includes(q) ||
        loc.includes(q) ||
        ind.includes(q) ||
        gradYear.includes(q) ||
        bio.includes(q) ||
        skills.some((s) => s.includes(q)) ||
        areas.some((a) => a.includes(q))
      );
    });
  }

  // Filter: Company
  if (company.trim()) {
    const compQ = company.toLowerCase().trim();
    list = list.filter((m) => (m.currentCompany || '').toLowerCase().includes(compQ));
  }

  // Filter: Industry
  if (industry.trim()) {
    const indQ = industry.toLowerCase().trim();
    list = list.filter((m) => (m.industry || '').toLowerCase().includes(indQ));
  }

  // Filter: Department
  if (department.trim()) {
    const deptQ = department.toLowerCase().trim();
    list = list.filter((m) => (m.department || '').toLowerCase().includes(deptQ));
  }

  // Filter: Location
  if (location.trim()) {
    const locQ = location.toLowerCase().trim();
    list = list.filter((m) => (m.location || '').toLowerCase().includes(locQ));
  }

  // Filter: Graduation Year
  if (graduationYear && String(graduationYear).trim()) {
    const yrStr = String(graduationYear).trim();
    list = list.filter((m) => String(m.graduationYear || '') === yrStr);
  }

  // Filter: Mentorship Area / Guidance
  if (area.trim()) {
    const areaQ = area.toLowerCase().trim();
    list = list.filter((m) =>
      (m.mentorshipAreas || []).some((a) => a.toLowerCase().includes(areaQ))
    );
  }

  // Filter: Skill
  if (skill.trim()) {
    const skillQ = skill.toLowerCase().trim();
    list = list.filter((m) =>
      (m.skills || []).some((s) => s.toLowerCase().includes(skillQ))
    );
  }

  // Filter: Minimum Experience
  if (minExp !== '' && !isNaN(Number(minExp))) {
    const min = Number(minExp);
    list = list.filter((m) => (m.yearsOfExperience || 0) >= min);
  }

  // Filter: Mentorship Availability
  if (availability && availability.trim() && availability !== 'all') {
    const availStr = availability.toLowerCase().trim();
    if (availStr === 'available' || availStr === 'true') {
      list = list.filter((m) => m.mentorshipAvailable === true);
    } else if (availStr === 'unavailable' || availStr === 'false') {
      list = list.filter((m) => m.mentorshipAvailable === false);
    }
  }

  // Sorting
  if (sort === 'experience') {
    list.sort((a, b) => (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0));
  } else if (sort === 'recent') {
    list.sort((a, b) => (b.graduationYear || 0) - (a.graduationYear || 0));
  } else if (sort === 'name') {
    list.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
  } else {
    // Default: 'recommended' by profile matchScore
    list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  return {
    mentors: list,
    total: list.length,
    hasStudentProfile: Boolean(studentProfile && (studentProfile.skills || []).length > 0),
  };
};

/**
 * Get public details of a single mentor by alumniId
 */
const getMentorDetails = async (alumniId, studentUserId = null) => {
  const alumniProfile = await findAlumniProfile(alumniId);
  if (!alumniProfile) {
    throw new NotFoundError('Mentor profile not found');
  }

  if (alumniProfile.verificationStatus !== 'VERIFIED') {
    throw new BadRequestError('This alumnus is not verified for mentorship.');
  }

  const publicData = sanitizeMentorPublicProfile(alumniProfile);
  let match = { matchScore: 60, matchLabel: 'Profile Match', matchReasons: [] };
  let existingMentorship = null;

  if (studentUserId) {
    const studentProfile = await findStudentProfile(studentUserId);
    match = calculateMentorMatch(studentProfile, alumniProfile);

    // Check existing relationship between this student and this mentor
    existingMentorship = await findMentorshipByPair(studentUserId, alumniId);
  }

  return {
    ...publicData,
    matchScore: match.matchScore,
    matchLabel: match.matchLabel,
    matchReasons: match.matchReasons,
    existingMentorship,
  };
};

/**
 * Find mentorship by student and alumni ID pair
 */
const findMentorshipByPair = async (studentId, alumniId) => {
  const sId = String(studentId);
  const aId = String(alumniId);

  if (isDbConnected()) {
    try {
      const record = await Mentorship.findOne({
        studentId: sId,
        alumniId: aId,
      })
        .sort({ createdAt: -1 })
        .lean();
      if (record) return record;
    } catch (e) {
      console.warn('DB query error for mentorship pair, fallback to memory:', e.message);
    }
  }

  return (
    memoryMentorships
      .filter((m) => String(m.studentId) === sId && String(m.alumniId) === aId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null
  );
};

/**
 * Find mentorship by its unique ID
 */
const findMentorshipById = async (id) => {
  const strId = String(id);
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(strId)) {
    try {
      const record = await Mentorship.findById(strId).lean();
      if (record) return record;
    } catch (e) {
      console.warn('DB query error for mentorship ID, fallback to memory:', e.message);
    }
  }

  return (
    memoryMentorships.find((m) => String(m._id || m.id) === strId) || null
  );
};

/**
 * Request Mentorship
 * Backend validates:
 * 1. Role: STUDENT
 * 2. Alumni exists, is VERIFIED, mentorshipAvailable = true
 * 3. studentId !== alumniId
 * 4. Duplicate prevention: NO active (PENDING or ACCEPTED) request exists
 */
const createMentorshipRequest = async ({
  studentId,
  alumniId,
  requestMessage = '',
  mentorshipAreas = [],
}) => {
  const sId = String(studentId);
  const aId = String(alumniId);

  if (sId === aId) {
    throw new BadRequestError('You cannot request mentorship from yourself.');
  }

  // Validate Alumni existence and verification
  const alumniProfile = await findAlumniProfile(aId);
  if (!alumniProfile) {
    throw new NotFoundError('Mentor profile not found.');
  }

  if (alumniProfile.verificationStatus !== 'VERIFIED') {
    throw new BadRequestError('Mentorship is only available with verified alumni.');
  }

  if (!alumniProfile.mentorshipAvailable) {
    throw new BadRequestError('This mentor is currently not accepting new mentorship requests.');
  }

  // Duplicate Prevention: Check for existing active relationships
  const existing = await findMentorshipByPair(sId, aId);
  if (existing) {
    if (existing.status === 'PENDING') {
      throw new BadRequestError(
        'You already have a pending mentorship request with this mentor. Please await their response.'
      );
    }
    if (existing.status === 'ACCEPTED') {
      throw new BadRequestError(
        'You already have an active mentorship relationship with this mentor.'
      );
    }
  }

  // Create record
  const newRecord = {
    _id: isDbConnected() ? new mongoose.Types.ObjectId() : 'mentorship_' + Date.now(),
    studentId: sId,
    alumniId: aId,
    requestedBy: 'STUDENT',
    status: 'PENDING',
    requestMessage: (requestMessage || '').trim(),
    responseMessage: '',
    mentorshipAreas: Array.isArray(mentorshipAreas) ? mentorshipAreas : [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (isDbConnected()) {
    try {
      const created = await Mentorship.create(newRecord);
      return created.toObject();
    } catch (e) {
      console.warn('DB create error for mentorship, using memory store:', e.message);
    }
  }

  memoryMentorships.push(newRecord);
  return newRecord;
};

/**
 * Get all mentorships for a Student
 */
const getStudentMentorships = async (studentId) => {
  const sId = String(studentId);
  let records = [];

  if (isDbConnected()) {
    try {
      records = await Mentorship.find({ studentId: sId })
        .sort({ updatedAt: -1 })
        .lean();
    } catch (e) {
      console.warn('DB error fetching student mentorships, falling back to memory:', e.message);
      records = memoryMentorships.filter((m) => String(m.studentId) === sId);
    }
  } else {
    records = memoryMentorships.filter((m) => String(m.studentId) === sId);
  }

  records.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  // Populate mentor public profile
  const populated = await Promise.all(
    records.map(async (rec) => {
      const alumniProfile = await findAlumniProfile(rec.alumniId);
      return {
        ...rec,
        mentor: sanitizeMentorPublicProfile(alumniProfile),
      };
    })
  );

  return populated;
};

/**
 * Get incoming requests & active mentorships for Alumni
 */
const getAlumniMentorships = async (alumniId) => {
  const aId = String(alumniId);
  let records = [];

  if (isDbConnected()) {
    try {
      records = await Mentorship.find({ alumniId: aId })
        .sort({ updatedAt: -1 })
        .lean();
    } catch (e) {
      console.warn('DB error fetching alumni mentorships, falling back to memory:', e.message);
      records = memoryMentorships.filter((m) => String(m.alumniId) === aId);
    }
  } else {
    records = memoryMentorships.filter((m) => String(m.alumniId) === aId);
  }

  records.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  // Populate student profile
  const populated = await Promise.all(
    records.map(async (rec) => {
      const studentProfile = await findStudentProfile(rec.studentId);
      const studentUser = await findUserById(rec.studentId);
      const sanitized = sanitizeStudentMenteeProfile(studentProfile);
      return {
        ...rec,
        student: {
          ...sanitized,
          fullName: sanitized?.fullName || studentUser?.name || 'Student Candidate',
          email: studentUser?.email,
        },
      };
    })
  );

  return populated;
};

/**
 * Transition validation helper
 */
const validateTransition = (currentStatus, targetStatus) => {
  const allowed = ALLOWED_MENTORSHIP_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new BadRequestError(
      `Invalid mentorship status transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: ${
        allowed.length > 0 ? allowed.join(', ') : 'None (Terminal state)'
      }`
    );
  }
};

/**
 * Accept mentorship request (Alumni only)
 */
const acceptMentorship = async (mentorshipId, alumniUserId) => {
  const record = await findMentorshipById(mentorshipId);
  if (!record) {
    throw new NotFoundError('Mentorship record not found.');
  }

  if (String(record.alumniId) !== String(alumniUserId)) {
    throw new ForbiddenError('You are not authorized to accept this mentorship request.');
  }

  validateTransition(record.status, 'ACCEPTED');

  const updates = {
    status: 'ACCEPTED',
    startedAt: new Date(),
    updatedAt: new Date(),
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(record._id)) {
    const updated = await Mentorship.findByIdAndUpdate(record._id, updates, {
      new: true,
    }).lean();
    return updated;
  }

  Object.assign(record, updates);
  return record;
};

/**
 * Reject mentorship request (Alumni only)
 */
const rejectMentorship = async (mentorshipId, alumniUserId, responseMessage = '') => {
  const record = await findMentorshipById(mentorshipId);
  if (!record) {
    throw new NotFoundError('Mentorship record not found.');
  }

  if (String(record.alumniId) !== String(alumniUserId)) {
    throw new ForbiddenError('You are not authorized to reject this mentorship request.');
  }

  validateTransition(record.status, 'REJECTED');

  const updates = {
    status: 'REJECTED',
    rejectedAt: new Date(),
    responseMessage: (responseMessage || '').trim(),
    updatedAt: new Date(),
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(record._id)) {
    const updated = await Mentorship.findByIdAndUpdate(record._id, updates, {
      new: true,
    }).lean();
    return updated;
  }

  Object.assign(record, updates);
  return record;
};

/**
 * Complete mentorship (Student or Alumni)
 */
const completeMentorship = async (mentorshipId, userId) => {
  const record = await findMentorshipById(mentorshipId);
  if (!record) {
    throw new NotFoundError('Mentorship record not found.');
  }

  const isStudent = String(record.studentId) === String(userId);
  const isAlumni = String(record.alumniId) === String(userId);

  if (!isStudent && !isAlumni) {
    throw new ForbiddenError('You are not a participant in this mentorship.');
  }

  validateTransition(record.status, 'COMPLETED');

  const updates = {
    status: 'COMPLETED',
    completedAt: new Date(),
    updatedAt: new Date(),
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(record._id)) {
    const updated = await Mentorship.findByIdAndUpdate(record._id, updates, {
      new: true,
    }).lean();
    return updated;
  }

  Object.assign(record, updates);
  return record;
};

/**
 * Cancel mentorship (Student or Alumni)
 */
const cancelMentorship = async (mentorshipId, userId) => {
  const record = await findMentorshipById(mentorshipId);
  if (!record) {
    throw new NotFoundError('Mentorship record not found.');
  }

  const isStudent = String(record.studentId) === String(userId);
  const isAlumni = String(record.alumniId) === String(userId);

  if (!isStudent && !isAlumni) {
    throw new ForbiddenError('You are not a participant in this mentorship.');
  }

  validateTransition(record.status, 'CANCELLED');

  const updates = {
    status: 'CANCELLED',
    cancelledAt: new Date(),
    cancelledBy: String(userId),
    updatedAt: new Date(),
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(record._id)) {
    const updated = await Mentorship.findByIdAndUpdate(record._id, updates, {
      new: true,
    }).lean();
    return updated;
  }

  Object.assign(record, updates);
  return record;
};

module.exports = {
  discoverMentors,
  getMentorDetails,
  createMentorshipRequest,
  getStudentMentorships,
  getAlumniMentorships,
  acceptMentorship,
  rejectMentorship,
  completeMentorship,
  cancelMentorship,
  calculateMentorMatch,
  ALLOWED_MENTORSHIP_TRANSITIONS,
  memoryMentorships,
};
