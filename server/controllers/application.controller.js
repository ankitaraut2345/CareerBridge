const asyncHandler = require('express-async-handler');
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require('../utils/error');
const { findOpportunityById } = require('../services/opportunityStore.service');
const { findProfileByUserId } = require('../services/studentProfileStore.service');
const { calculateEligibility } = require('../services/eligibility.service');
const {
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
} = require('../services/applicationStore.service');
const { createNotification } = require('../services/notificationStore.service');

/**
 * GET /api/opportunities/:id/eligibility
 * Dynamically evaluates current student's eligibility for an opportunity
 */
const checkEligibilityHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const opportunity = await findOpportunityById(id);
  if (!opportunity) {
    throw new NotFoundError('Opportunity not found');
  }

  // Fetch student's profile
  const studentProfile = await findProfileByUserId(req.user.id);

  // Compute dynamic eligibility (never permanently stored)
  const eligibility = calculateEligibility(studentProfile, opportunity);

  // Check if student has already applied
  const existingApp = await findExistingApplication(req.user.id, id);

  res.status(200).json({
    success: true,
    data: {
      ...eligibility,
      hasApplied: !!existingApp,
      existingApplication: existingApp || null,
      opportunityTitle: opportunity.title,
      companyName: opportunity.companyName,
    },
  });
});

/**
 * POST /api/opportunities/:id/apply
 * Applies to an opportunity after full backend validation:
 * 1. Role verification
 * 2. Opportunity existence & published state
 * 3. Deadline enforcement
 * 4. Duplicate prevention
 * 5. Backend dynamic eligibility verification
 * 6. Resume verification & snapshotting
 */
const applyToOpportunityHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { applicationMessage } = req.body;

  // 1. Verify opportunity exists
  const opportunity = await findOpportunityById(id);
  if (!opportunity) {
    throw new NotFoundError('Opportunity not found');
  }

  // 2. Verify opportunity is open and published
  if (opportunity.status !== 'PUBLISHED') {
    throw new BadRequestError(
      `Cannot apply to an opportunity with status '${opportunity.status}'. Only PUBLISHED opportunities accept applications.`
    );
  }

  // 3. Deadline Enforcement
  const now = new Date();
  const deadline = new Date(opportunity.applicationDeadline);
  if (!isNaN(deadline.getTime()) && now > deadline) {
    throw new BadRequestError('Applications for this opportunity are closed (deadline passed).');
  }

  // 4. Duplicate Application Prevention (Layer 1)
  const existing = await findExistingApplication(req.user.id, id);
  if (existing) {
    throw new ConflictError('You have already applied to this opportunity.');
  }

  // 5. Load student profile
  const studentProfile = await findProfileByUserId(req.user.id);
  if (!studentProfile) {
    throw new BadRequestError(
      'Your student profile is incomplete. Please complete your profile before applying.'
    );
  }

  // 6. Resume presence check
  if (!studentProfile.resume || !studentProfile.resume.url) {
    throw new BadRequestError(
      'An active resume is required. Please upload your resume to your profile before applying.'
    );
  }

  // 7. Backend Dynamic Eligibility Verification
  // NEVER trust frontend claims of eligibility
  const eligibility = calculateEligibility(studentProfile, opportunity);
  if (!eligibility.eligible) {
    if (eligibility.state === 'INCOMPLETE_PROFILE') {
      throw new BadRequestError(
        `Unable to apply: Your profile is missing required information to determine eligibility. Details: ${eligibility.message}`
      );
    }
    throw new BadRequestError(
      'You do not meet the academic eligibility criteria required for this opportunity.'
    );
  }

  // 8. Construct Application Record with Profile Snapshot and Resume Snapshot
  const applicationData = {
    studentId: req.user.id,
    opportunityId: id,
    studentProfileSnapshot: {
      fullName: studentProfile.fullName || req.user.name,
      email: req.user.email,
      department: studentProfile.department || '',
      graduationYear: studentProfile.graduationYear || null,
      cgpa: studentProfile.cgpa !== undefined ? Number(studentProfile.cgpa) : null,
      backlogs: studentProfile.backlogs !== undefined ? Number(studentProfile.backlogs) : 0,
      skills: Array.isArray(studentProfile.skills) ? [...studentProfile.skills] : [],
      college: studentProfile.college || '',
      phone: studentProfile.phone || '',
    },
    resume: {
      url: studentProfile.resume.url,
      publicId: studentProfile.resume.publicId || '',
      originalName: studentProfile.resume.originalName || 'student_resume.pdf',
      uploadedAt: studentProfile.resume.uploadedAt || new Date(),
    },
    applicationMessage: applicationMessage ? String(applicationMessage).trim().slice(0, 1500) : '',
    status: 'APPLIED',
    eligibilitySnapshot: {
      state: eligibility.state,
      evaluatedAt: new Date(),
      criteriaPassedCount: eligibility.checks.filter((c) => c.passed).length,
      totalCriteriaCount: eligibility.checks.length,
    },
    appliedAt: new Date(),
  };

  const created = await createApplicationRecord(applicationData);

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully!',
    data: created,
  });
});

/**
 * GET /api/applications/my
 * Retrieve all applications submitted by the authenticated student
 */
const getMyApplicationsHandler = asyncHandler(async (req, res) => {
  const { search, type, status, sort, page, limit } = req.query;

  const result = await findApplicationsByStudent(req.user.id, {
    search,
    type,
    status,
    sort,
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    data: result.applications,
    pagination: result.pagination,
  });
});

/**
 * GET /api/applications/:id
 * Retrieve details for a single application with ownership verification
 */
const getApplicationByIdHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    throw new NotFoundError('Application not found');
  }

  // Security & Ownership rules:
  // - STUDENT: Can only view their own application
  // - TPO: Can only view application if they created the opportunity (or ADMIN)
  if (req.user.role === 'STUDENT' && String(app.studentId) !== String(req.user.id)) {
    throw new ForbiddenError('You are not authorized to view this application.');
  }

  if (req.user.role === 'TPO') {
    const opp = app.opportunity;
    if (opp && String(opp.createdBy) !== String(req.user.id) && req.user.role !== 'ADMIN') {
      throw new ForbiddenError('You are not authorized to view applicants for this drive.');
    }
  }

  if (req.user.role === 'ALUMNI') {
    throw new ForbiddenError('Alumni accounts cannot access student application records.');
  }

  res.status(200).json({
    success: true,
    data: app,
  });
});

/**
 * PATCH /api/applications/:id/withdraw
 * Allows student to withdraw an early-stage application
 */
const withdrawApplicationHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = '' } = req.body;

  const updated = await withdrawApplicationRecord(id, req.user.id, reason);

  res.status(200).json({
    success: true,
    message: 'Application withdrawn successfully',
    data: updated,
  });
});

/**
 * GET /api/opportunities/:id/applications
 * TPO / Admin view of all applicants for an opportunity
 */
const getOpportunityApplicantsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { search, department, graduationYear, status, page, limit } = req.query;

  const opportunity = await findOpportunityById(id);
  if (!opportunity) {
    throw new NotFoundError('Opportunity not found');
  }

  // Verify TPO ownership unless user is Admin
  if (req.user.role !== 'ADMIN' && String(opportunity.createdBy) !== String(req.user.id)) {
    throw new ForbiddenError('You are not authorized to view applicants for this opportunity.');
  }

  const result = await findApplicantsByOpportunity(id, {
    search,
    department,
    graduationYear,
    status,
    page,
    limit,
  });

  const formattedApplicants = result.applicants.map((a) => {
    const snap = a.studentProfileSnapshot || a.studentSnapshot || {};
    return {
      ...a,
      studentSnapshot: snap,
      student: {
        id: a.studentId,
        name: snap.fullName || 'Student Candidate',
        email: snap.email || '',
        department: snap.department || '',
        graduationYear: snap.graduationYear || '',
        cgpa: snap.cgpa || '',
        backlogs: snap.backlogs ?? 0,
        skills: snap.skills || [],
      },
      resume: a.resume
        ? {
            url: a.resume.url,
            fileName: a.resume.originalName || a.resume.fileName || 'Resume.pdf',
          }
        : null,
    };
  });

  res.status(200).json({
    success: true,
    opportunity: {
      id: opportunity.id || opportunity._id,
      title: opportunity.title,
      companyName: opportunity.companyName,
      type: opportunity.type,
      status: opportunity.status,
    },
    data: formattedApplicants,
    pagination: result.pagination,
  });
});

/**
 * PATCH /api/applications/:id/status
 * TPO / Admin updates application recruitment status (Phase 7)
 */
const updateApplicationStatusHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  if (!status) {
    throw new BadRequestError('New status is required');
  }

  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    throw new NotFoundError('Application not found');
  }

  // Verify TPO authorization: must be creator of the opportunity unless ADMIN
  if (req.user.role !== 'ADMIN') {
    const opp = app.opportunity;
    if (opp && String(opp.createdBy) !== String(req.user.id)) {
      throw new ForbiddenError('You are not authorized to manage applications for this drive.');
    }
  }

  const updated = await updateApplicationStatusRecord(
    id,
    status,
    note,
    req.user.id,
    req.user.name,
    req.user.role
  );

  // Trigger in-app notification to student
  try {
    const opp = app.opportunity || {};
    const roleName = opp.title || opp.role || 'Position';
    const company = opp.companyName || 'Company';
    const normalizedStatus = status.toUpperCase();

    let notifTitle = 'Application Status Updated';
    let notifMsg = `Your application for ${roleName} at ${company} was updated to ${normalizedStatus}.`;

    if (normalizedStatus === 'SHORTLISTED') {
      notifTitle = 'Application Shortlisted';
      notifMsg = `You have been shortlisted for ${roleName} at ${company}.`;
    } else if (normalizedStatus === 'INTERVIEW') {
      notifTitle = 'Interview Stage Updated';
      notifMsg = `Your application for ${roleName} at ${company} has moved to the interview stage.`;
    } else if (normalizedStatus === 'SELECTED') {
      notifTitle = 'Congratulations! You Were Selected';
      notifMsg = `You have been selected for ${roleName} at ${company}!`;
    } else if (normalizedStatus === 'REJECTED') {
      notifTitle = 'Application Status Updated';
      notifMsg = `Your application for ${roleName} at ${company} was not selected.`;
    } else if (normalizedStatus === 'WAITLISTED') {
      notifTitle = 'Application Waitlisted';
      notifMsg = `Your application for ${roleName} at ${company} has been placed on the waitlist.`;
    }

    createNotification({
      recipientId: app.studentId,
      type: 'APPLICATION_STATUS_CHANGED',
      title: notifTitle,
      message: notifMsg,
      relatedEntityType: 'Application',
      relatedEntityId: id,
      actionUrl: `/student/applications/${id}`,
    }).catch((err) => console.error('[Notification] Error creating application status notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] App status trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: `Application status updated to ${status.toUpperCase()}`,
    data: updated,
  });
});

/**
 * POST /api/applications/:id/interview
 * TPO / Admin schedules an interview for an applicant (Phase 7)
 */
const scheduleInterviewHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    throw new NotFoundError('Application not found');
  }

  // Verify TPO authorization
  if (req.user.role !== 'ADMIN') {
    const opp = app.opportunity;
    if (opp && String(opp.createdBy) !== String(req.user.id)) {
      throw new ForbiddenError('You are not authorized to schedule interviews for this drive.');
    }
  }

  const updated = await scheduleInterviewRecord(id, req.body, req.user.id, req.user.name);

  // Trigger in-app notification to student
  try {
    const opp = app.opportunity || {};
    const roleName = opp.title || opp.role || 'Position';
    const company = opp.companyName || 'Company';
    const interviewDate = req.body.scheduledDate
      ? new Date(req.body.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      : 'the scheduled date';

    createNotification({
      recipientId: app.studentId,
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview Scheduled',
      message: `Your interview for ${roleName} at ${company} has been scheduled for ${interviewDate}.`,
      relatedEntityType: 'Application',
      relatedEntityId: id,
      actionUrl: `/student/applications/${id}`,
    }).catch((err) => console.error('[Notification] Error creating interview scheduled notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Interview schedule trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Interview scheduled successfully',
    data: updated,
  });
});

/**
 * PUT /api/applications/:id/interview
 * TPO / Admin updates scheduled interview details (Phase 7)
 */
const updateInterviewHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    throw new NotFoundError('Application not found');
  }

  if (req.user.role !== 'ADMIN') {
    const opp = app.opportunity;
    if (opp && String(opp.createdBy) !== String(req.user.id)) {
      throw new ForbiddenError('You are not authorized to update interviews for this drive.');
    }
  }

  const updated = await updateInterviewRecord(id, req.body, req.user.id, req.user.name);

  // Trigger in-app notification to student
  try {
    const opp = app.opportunity || {};
    const roleName = opp.title || opp.role || 'Position';
    const company = opp.companyName || 'Company';

    createNotification({
      recipientId: app.studentId,
      type: 'INTERVIEW_UPDATED',
      title: 'Interview Updated',
      message: `Your interview details for ${roleName} at ${company} have been updated.`,
      relatedEntityType: 'Application',
      relatedEntityId: id,
      actionUrl: `/student/applications/${id}`,
    }).catch((err) => console.error('[Notification] Error creating interview updated notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Interview update trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Interview details updated successfully',
    data: updated,
  });
});

/**
 * DELETE /api/applications/:id/interview
 * TPO / Admin cancels scheduled interview (Phase 7)
 */
const cancelInterviewHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = '' } = req.body || {};

  const app = await findApplicationByIdWithDetails(id);
  if (!app) {
    throw new NotFoundError('Application not found');
  }

  if (req.user.role !== 'ADMIN') {
    const opp = app.opportunity;
    if (opp && String(opp.createdBy) !== String(req.user.id)) {
      throw new ForbiddenError('You are not authorized to cancel interviews for this drive.');
    }
  }

  const updated = await cancelInterviewRecord(id, reason, req.user.id, req.user.name);

  // Trigger in-app notification to student
  try {
    const opp = app.opportunity || {};
    const roleName = opp.title || opp.role || 'Position';
    const company = opp.companyName || 'Company';

    createNotification({
      recipientId: app.studentId,
      type: 'INTERVIEW_CANCELLED',
      title: 'Interview Cancelled',
      message: `Your interview for ${roleName} at ${company} has been cancelled.${reason ? ` Reason: "${reason}"` : ''}`,
      relatedEntityType: 'Application',
      relatedEntityId: id,
      actionUrl: `/student/applications/${id}`,
    }).catch((err) => console.error('[Notification] Error creating interview cancelled notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Interview cancel trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Interview cancelled successfully',
    data: updated,
  });
});

module.exports = {
  checkEligibilityHandler,
  applyToOpportunityHandler,
  getMyApplicationsHandler,
  getApplicationByIdHandler,
  withdrawApplicationHandler,
  getOpportunityApplicantsHandler,
  updateApplicationStatusHandler,
  scheduleInterviewHandler,
  updateInterviewHandler,
  cancelInterviewHandler,
};
