const mongoose = require('mongoose');
const Application = require('../models/Application.model');
const { findOpportunityById } = require('./opportunityStore.service');

const isDbConnected = () => mongoose.connection.readyState === 1;

let APPLICATIONS_SEED = [];
try {
  APPLICATIONS_SEED = require('../seed/seedData').APPLICATIONS_SEED;
} catch {}

const memoryApplications = (APPLICATIONS_SEED && APPLICATIONS_SEED.length > 0)
  ? APPLICATIONS_SEED.map((a, idx) => ({
      _id: `mem_app_${idx + 1}`,
      studentId: a.studentKey,
      opportunityId: a.oppKey,
      status: a.status,
      applicationMessage: a.applicationMessage || '',
      statusHistory: (a.history || []).map((h) => ({
        status: h.status,
        changedAt: new Date(Date.now() - (h.daysAgo || 0) * 86400000),
        changedByName: 'Dr. Rajesh Khanna (TPO)',
        note: h.note || `Status changed to ${h.status}`,
      })),
      interview: a.interview || null,
      resume: {
        url: 'https://res.cloudinary.com/careerbridge/raw/upload/v1728000000/resumes/demo_student_resume.pdf',
        originalName: `${a.studentKey}_Resume.pdf`,
        uploadedAt: new Date(),
      },
      appliedAt: new Date(Date.now() - ((a.history && a.history[0]?.daysAgo) || 5) * 86400000),
      createdAt: new Date(Date.now() - ((a.history && a.history[0]?.daysAgo) || 5) * 86400000),
      updatedAt: new Date(),
    }))
  : [];

// Phase 7: Canonical Status Transition Rules
const ALLOWED_STATUS_TRANSITIONS = {
  APPLIED: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED', 'WAITLISTED', 'WITHDRAWN'],
  INTERVIEW: ['SELECTED', 'REJECTED', 'WAITLISTED', 'INTERVIEW', 'WITHDRAWN'],
  WAITLISTED: ['SELECTED', 'REJECTED', 'INTERVIEW', 'WITHDRAWN'],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

/**
 * Format and enrich application object with history, resume, and opportunity
 */
const formatApplicationDoc = (app, opp) => {
  const history =
    Array.isArray(app.statusHistory) && app.statusHistory.length > 0
      ? app.statusHistory
      : [
          {
            status: app.status || 'APPLIED',
            changedAt: app.appliedAt || app.createdAt || new Date(),
            changedByName: 'Applicant',
            note: app.applicationMessage
              ? 'Application submitted with cover note'
              : 'Application submitted',
          },
        ];

  return {
    ...app,
    opportunity: opp || null,
    statusHistory: history,
    interview: app.interview || null,
    resume: app.resume
      ? {
          ...app.resume,
          fileName: app.resume.originalName || app.resume.fileName || 'Resume.pdf',
        }
      : null,
    studentSnapshot: app.studentProfileSnapshot || app.studentSnapshot || null,
  };
};

/**
 * Check if student has already applied to an opportunity
 */
const findExistingApplication = async (studentId, opportunityId) => {
  const sId = String(studentId);
  const oId = String(opportunityId);

  if (isDbConnected()) {
    const existing = await Application.findOne({ studentId: sId, opportunityId: oId }).lean();
    if (existing) return { ...existing, id: existing._id ? existing._id.toString() : existing.id };
  }

  const mem = memoryApplications.find(
    (app) => String(app.studentId) === sId && String(app.opportunityId) === oId
  );
  if (mem) {
    return { ...mem, id: mem._id ? mem._id.toString() : mem.id };
  }
  return null;
};

/**
 * Create a new application
 */
const createApplicationRecord = async (data) => {
  const sId = String(data.studentId);
  const oId = String(data.opportunityId);

  // Check duplicate
  const duplicate = await findExistingApplication(sId, oId);
  if (duplicate) {
    const err = new Error('You have already applied to this opportunity.');
    err.statusCode = 409;
    throw err;
  }

  const initialHistory = [
    {
      status: 'APPLIED',
      changedAt: new Date(),
      changedBy: sId,
      changedByName: data.studentProfileSnapshot?.fullName || 'Applicant',
      note: data.applicationMessage
        ? 'Application submitted with cover note'
        : 'Application submitted',
    },
  ];

  if (isDbConnected()) {
    const created = await Application.create({
      ...data,
      studentId: sId,
      opportunityId: oId,
      statusHistory: initialHistory,
    });
    const obj = created.toObject();
    return { ...obj, id: obj._id.toString() };
  }

  const newApp = {
    ...data,
    _id: 'app_' + Date.now(),
    studentId: sId,
    opportunityId: oId,
    status: data.status || 'APPLIED',
    statusHistory: initialHistory,
    interview: null,
    appliedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryApplications.unshift(newApp);
  return { ...newApp, id: newApp._id };
};

/**
 * Retrieve all applications for a student with opportunity details
 */
const findApplicationsByStudent = async (
  studentId,
  { search = '', type = '', status = '', sort = 'newest', page = 1, limit = 10 }
) => {
  const sId = String(studentId);
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  let allApps = [];

  if (isDbConnected()) {
    const dbApps = await Application.find({ studentId: sId }).sort({ createdAt: -1 }).lean();
    allApps = dbApps.map((a) => ({ ...a, id: a._id.toString() }));
  } else {
    allApps = memoryApplications
      .filter((a) => String(a.studentId) === sId)
      .map((a) => ({ ...a, id: a._id ? a._id.toString() : a.id }));
  }

  // Enrich with Opportunity details
  const enriched = await Promise.all(
    allApps.map(async (app) => {
      const opp = await findOpportunityById(app.opportunityId);
      return formatApplicationDoc(app, opp);
    })
  );

  // Filter enriched records
  let filtered = enriched.filter((app) => !!app.opportunity);

  if (status) {
    filtered = filtered.filter((a) => a.status === status.toUpperCase());
  }

  if (type) {
    filtered = filtered.filter(
      (a) => a.opportunity && a.opportunity.type === type.toUpperCase()
    );
  }

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter((a) => {
      const titleMatch = a.opportunity.title?.toLowerCase().includes(term);
      const companyMatch = a.opportunity.companyName?.toLowerCase().includes(term);
      const roleMatch = a.opportunity.role?.toLowerCase().includes(term);
      return titleMatch || companyMatch || roleMatch;
    });
  }

  // Sort
  filtered.sort((a, b) => {
    if (sort === 'oldest') {
      return (
        new Date(a.appliedAt || a.createdAt).getTime() -
        new Date(b.appliedAt || b.createdAt).getTime()
      );
    }
    if (sort === 'deadline') {
      const dA = a.opportunity.applicationDeadline
        ? new Date(a.opportunity.applicationDeadline).getTime()
        : 0;
      const dB = b.opportunity.applicationDeadline
        ? new Date(b.opportunity.applicationDeadline).getTime()
        : 0;
      return dA - dB;
    }
    if (sort === 'interview') {
      const dateA = a.interview?.date ? new Date(a.interview.date).getTime() : Infinity;
      const dateB = b.interview?.date ? new Date(b.interview.date).getTime() : Infinity;
      return dateA - dateB;
    }
    return (
      new Date(b.appliedAt || b.createdAt).getTime() -
      new Date(a.appliedAt || a.createdAt).getTime()
    );
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limitNum) || 1;
  const paged = filtered.slice(skip, skip + limitNum);

  return {
    applications: paged,
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
 * Retrieve single application by ID with opportunity details
 */
const findApplicationByIdWithDetails = async (id) => {
  let app = null;

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const doc = await Application.findById(id).lean();
    if (doc) app = { ...doc, id: doc._id.toString() };
  }

  if (!app) {
    const mem = memoryApplications.find(
      (a) => (a._id ? a._id.toString() : a.id) === id || a._id === id
    );
    if (mem) app = { ...mem, id: mem._id ? mem._id.toString() : mem.id };
  }

  if (!app) return null;

  const opp = await findOpportunityById(app.opportunityId);
  return formatApplicationDoc(app, opp);
};

/**
 * Update application recruitment lifecycle status (Phase 7)
 */
const updateApplicationStatusRecord = async (
  id,
  newStatus,
  note = '',
  userId = '',
  userName = '',
  userRole = 'TPO'
) => {
  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }

  const validStatuses = [
    'APPLIED',
    'SHORTLISTED',
    'INTERVIEW',
    'SELECTED',
    'REJECTED',
    'WAITLISTED',
    'WITHDRAWN',
  ];

  const targetStatus = newStatus.toUpperCase();
  if (!validStatuses.includes(targetStatus)) {
    const err = new Error(`Invalid status '${newStatus}'. Allowed: ${validStatuses.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const currentStatus = app.status;

  // Validate status transition rule (Admin can bypass in special cases if necessary)
  if (userRole !== 'ADMIN' && currentStatus !== targetStatus) {
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      const err = new Error(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed next stages: ${
          allowed.length ? allowed.join(', ') : 'None (Terminal state)'
        }`
      );
      err.statusCode = 400;
      throw err;
    }
  }

  const historyEntry = {
    status: targetStatus,
    changedAt: new Date(),
    changedBy: userId,
    changedByName: userName || 'Coordinator',
    note: note ? note.trim().slice(0, 1000) : '',
  };

  const updatedHistory = [...(app.statusHistory || []), historyEntry];
  const updates = {
    status: targetStatus,
    statusHistory: updatedHistory,
    updatedAt: new Date(),
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const updated = await Application.findByIdAndUpdate(id, updates, { new: true }).lean();
    const opp = await findOpportunityById(app.opportunityId);
    return formatApplicationDoc({ ...updated, id: updated._id.toString() }, opp);
  }

  const index = memoryApplications.findIndex(
    (a) => (a._id ? a._id.toString() : a.id) === id || a._id === id
  );
  if (index !== -1) {
    memoryApplications[index] = { ...memoryApplications[index], ...updates };
    const opp = await findOpportunityById(app.opportunityId);
    return formatApplicationDoc(
      { ...memoryApplications[index], id: memoryApplications[index]._id },
      opp
    );
  }

  return null;
};

/**
 * Schedule an Interview for an application (Phase 7)
 */
const scheduleInterviewRecord = async (id, interviewData, userId = '', userName = '') => {
  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }

  if (app.status === 'REJECTED' || app.status === 'WITHDRAWN') {
    const err = new Error(`Cannot schedule interview for an application in '${app.status}' status.`);
    err.statusCode = 400;
    throw err;
  }

  // Validate required interview fields
  if (!interviewData.date || !interviewData.startTime) {
    const err = new Error('Interview date and start time are required.');
    err.statusCode = 400;
    throw err;
  }

  const mode = (interviewData.mode || 'ONLINE').toUpperCase();
  if (mode === 'ONLINE' && !interviewData.meetingLink) {
    const err = new Error('A meeting link is required for online interviews.');
    err.statusCode = 400;
    throw err;
  }

  if (mode === 'OFFLINE' && !interviewData.location) {
    const err = new Error('A campus or office location is required for offline interviews.');
    err.statusCode = 400;
    throw err;
  }

  const interview = {
    round: interviewData.round?.trim() || 'Technical Round',
    title:
      interviewData.title?.trim() ||
      `${interviewData.round?.trim() || 'Technical'} Interview`,
    date: interviewData.date.trim(),
    startTime: interviewData.startTime.trim(),
    endTime: interviewData.endTime?.trim() || '',
    mode,
    meetingLink: interviewData.meetingLink?.trim() || '',
    location: interviewData.location?.trim() || '',
    interviewer: interviewData.interviewer?.trim() || '',
    instructions: interviewData.instructions?.trim() || '',
    status: 'SCHEDULED',
    scheduledAt: new Date(),
    updatedAt: new Date(),
  };

  const updates = {
    interview,
    updatedAt: new Date(),
  };

  // If application is not already in INTERVIEW status, transition it to INTERVIEW
  if (app.status !== 'INTERVIEW') {
    updates.status = 'INTERVIEW';
    const historyEntry = {
      status: 'INTERVIEW',
      changedAt: new Date(),
      changedBy: userId,
      changedByName: userName || 'TPO',
      note: `Interview scheduled: ${interview.round} on ${interview.date} at ${interview.startTime} (${interview.mode})`,
    };
    updates.statusHistory = [...(app.statusHistory || []), historyEntry];
  } else {
    // Add note in history for newly scheduled round
    const historyEntry = {
      status: 'INTERVIEW',
      changedAt: new Date(),
      changedBy: userId,
      changedByName: userName || 'TPO',
      note: `Interview round scheduled: ${interview.round} on ${interview.date} at ${interview.startTime}`,
    };
    updates.statusHistory = [...(app.statusHistory || []), historyEntry];
  }

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const updated = await Application.findByIdAndUpdate(id, updates, { new: true }).lean();
    const opp = await findOpportunityById(app.opportunityId);
    return formatApplicationDoc({ ...updated, id: updated._id.toString() }, opp);
  }

  const index = memoryApplications.findIndex(
    (a) => (a._id ? a._id.toString() : a.id) === id || a._id === id
  );
  if (index !== -1) {
    memoryApplications[index] = { ...memoryApplications[index], ...updates };
    const opp = await findOpportunityById(app.opportunityId);
    return formatApplicationDoc(
      { ...memoryApplications[index], id: memoryApplications[index]._id },
      opp
    );
  }

  return null;
};

/**
 * Update an existing interview (Phase 7)
 */
const updateInterviewRecord = async (id, interviewData, userId = '', userName = '') => {
  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }

  if (!app.interview) {
    const err = new Error('No interview currently exists on this application to update.');
    err.statusCode = 400;
    throw err;
  }

  const current = app.interview;
  const mode = (interviewData.mode || current.mode || 'ONLINE').toUpperCase();

  if (mode === 'ONLINE' && !interviewData.meetingLink && !current.meetingLink) {
    const err = new Error('A meeting link is required for online interviews.');
    err.statusCode = 400;
    throw err;
  }

  if (mode === 'OFFLINE' && !interviewData.location && !current.location) {
    const err = new Error('A location is required for offline interviews.');
    err.statusCode = 400;
    throw err;
  }

  const updatedInterview = {
    ...current,
    round: interviewData.round?.trim() || current.round,
    title: interviewData.title?.trim() || current.title,
    date: interviewData.date?.trim() || current.date,
    startTime: interviewData.startTime?.trim() || current.startTime,
    endTime:
      interviewData.endTime !== undefined ? interviewData.endTime?.trim() : current.endTime,
    mode,
    meetingLink:
      interviewData.meetingLink !== undefined
        ? interviewData.meetingLink?.trim()
        : current.meetingLink,
    location:
      interviewData.location !== undefined ? interviewData.location?.trim() : current.location,
    interviewer:
      interviewData.interviewer !== undefined
        ? interviewData.interviewer?.trim()
        : current.interviewer,
    instructions:
      interviewData.instructions !== undefined
        ? interviewData.instructions?.trim()
        : current.instructions,
    status: interviewData.status ? interviewData.status.toUpperCase() : current.status,
    updatedAt: new Date(),
  };

  const updates = {
    interview: updatedInterview,
    updatedAt: new Date(),
  };

  // Add history note if rescheduled or completed
  if (
    interviewData.status === 'RESCHEDULED' ||
    interviewData.date !== current.date ||
    interviewData.startTime !== current.startTime
  ) {
    const note = `Interview updated/rescheduled: ${updatedInterview.round} now on ${updatedInterview.date} at ${updatedInterview.startTime}`;
    updates.statusHistory = [
      ...(app.statusHistory || []),
      {
        status: app.status,
        changedAt: new Date(),
        changedBy: userId,
        changedByName: userName || 'TPO',
        note,
      },
    ];
  }

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const updated = await Application.findByIdAndUpdate(id, updates, { new: true }).lean();
    const opp = await findOpportunityById(app.opportunityId);
    return formatApplicationDoc({ ...updated, id: updated._id.toString() }, opp);
  }

  const index = memoryApplications.findIndex(
    (a) => (a._id ? a._id.toString() : a.id) === id || a._id === id
  );
  if (index !== -1) {
    memoryApplications[index] = { ...memoryApplications[index], ...updates };
    const opp = await findOpportunityById(app.opportunityId);
    return formatApplicationDoc(
      { ...memoryApplications[index], id: memoryApplications[index]._id },
      opp
    );
  }

  return null;
};

/**
 * Cancel an interview (Phase 7)
 */
const cancelInterviewRecord = async (id, reason = '', userId = '', userName = '') => {
  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }

  if (!app.interview) {
    const err = new Error('No interview exists on this application.');
    err.statusCode = 400;
    throw err;
  }

  const updatedInterview = {
    ...app.interview,
    status: 'CANCELLED',
    updatedAt: new Date(),
  };

  const historyEntry = {
    status: app.status,
    changedAt: new Date(),
    changedBy: userId,
    changedByName: userName || 'TPO',
    note: `Interview cancelled${reason ? ': ' + reason.trim() : '.'}`,
  };

  const updates = {
    interview: updatedInterview,
    statusHistory: [...(app.statusHistory || []), historyEntry],
    updatedAt: new Date(),
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const updated = await Application.findByIdAndUpdate(id, updates, { new: true }).lean();
    const opp = await findOpportunityById(app.opportunityId);
    return formatApplicationDoc({ ...updated, id: updated._id.toString() }, opp);
  }

  const index = memoryApplications.findIndex(
    (a) => (a._id ? a._id.toString() : a.id) === id || a._id === id
  );
  if (index !== -1) {
    memoryApplications[index] = { ...memoryApplications[index], ...updates };
    const opp = await findOpportunityById(app.opportunityId);
    return formatApplicationDoc(
      { ...memoryApplications[index], id: memoryApplications[index]._id },
      opp
    );
  }

  return null;
};

/**
 * Withdraw an application (only permitted if still in APPLIED stage)
 */
const withdrawApplicationRecord = async (id, studentId, reason = '') => {
  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }

  if (String(app.studentId) !== String(studentId)) {
    const err = new Error('Unauthorized to withdraw this application');
    err.statusCode = 403;
    throw err;
  }

  if (app.status !== 'APPLIED') {
    const err = new Error(
      `Cannot withdraw application currently in '${app.status}' status. Only newly submitted applications can be withdrawn.`
    );
    err.statusCode = 400;
    throw err;
  }

  const historyEntry = {
    status: 'WITHDRAWN',
    changedAt: new Date(),
    changedBy: studentId,
    changedByName: 'Applicant',
    note: reason ? `Application withdrawn: ${reason.trim()}` : 'Application withdrawn by student',
  };

  const updates = {
    status: 'WITHDRAWN',
    withdrawnAt: new Date(),
    withdrawalReason: reason.trim(),
    statusHistory: [...(app.statusHistory || []), historyEntry],
    updatedAt: new Date(),
  };

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const updated = await Application.findByIdAndUpdate(id, updates, { new: true }).lean();
    return { ...updated, id: updated._id.toString() };
  }

  const index = memoryApplications.findIndex(
    (a) => (a._id ? a._id.toString() : a.id) === id || a._id === id
  );
  if (index !== -1) {
    memoryApplications[index] = { ...memoryApplications[index], ...updates };
    return { ...memoryApplications[index], id: memoryApplications[index]._id };
  }

  return null;
};

/**
 * Retrieve all applicants for an opportunity (for TPO or Admin)
 */
const findApplicantsByOpportunity = async (
  opportunityId,
  { search = '', department = '', graduationYear = '', status = '', page = 1, limit = 20 }
) => {
  const oId = String(opportunityId);
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  let apps = [];

  if (isDbConnected()) {
    const dbApps = await Application.find({ opportunityId: oId }).sort({ appliedAt: -1 }).lean();
    apps = dbApps.map((a) => ({ ...a, id: a._id.toString() }));
  } else {
    apps = memoryApplications
      .filter((a) => String(a.opportunityId) === oId)
      .map((a) => ({ ...a, id: a._id ? a._id.toString() : a.id }));
  }

  // Filter applicants
  let filtered = [...apps];

  if (status) {
    filtered = filtered.filter((a) => a.status === status.toUpperCase());
  }

  if (department) {
    const depLower = department.toLowerCase();
    filtered = filtered.filter((a) =>
      a.studentProfileSnapshot?.department?.toLowerCase().includes(depLower)
    );
  }

  if (graduationYear) {
    filtered = filtered.filter(
      (a) => Number(a.studentProfileSnapshot?.graduationYear) === Number(graduationYear)
    );
  }

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    filtered = filtered.filter((a) => {
      const snap = a.studentProfileSnapshot || {};
      const nameMatch = snap.fullName?.toLowerCase().includes(term);
      const emailMatch = snap.email?.toLowerCase().includes(term);
      const skillsMatch = snap.skills?.some((s) => s.toLowerCase().includes(term));
      return nameMatch || emailMatch || skillsMatch;
    });
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limitNum) || 1;
  const paged = filtered.slice(skip, skip + limitNum);

  return {
    applicants: paged.map((a) => formatApplicationDoc(a, null)),
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

module.exports = {
  ALLOWED_STATUS_TRANSITIONS,
  findExistingApplication,
  createApplicationRecord,
  findApplicationsByStudent,
  findApplicationByIdWithDetails,
  updateApplicationStatusRecord,
  scheduleInterviewRecord,
  updateInterviewRecord,
  cancelInterviewRecord,
  withdrawApplicationRecord,
  findApplicantsByOpportunity,
  memoryApplications,
};
