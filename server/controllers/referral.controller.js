const asyncHandler = require('express-async-handler');
const {
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
} = require('../services/referralStore.service');
const { BadRequestError } = require('../utils/error');
const { createNotification } = require('../services/notificationStore.service');

/**
 * GET /api/referrals/opportunities
 * Discover open referral opportunities
 */
const getReferralOpportunitiesHandler = asyncHandler(async (req, res) => {
  const { search, company, industry, workMode, location, skill, sort } = req.query;
  const studentUserId = req.user?.role === 'STUDENT' ? req.user.id : null;

  const result = await discoverReferralOpportunities({
    studentUserId,
    search: search || '',
    company: company || '',
    industry: industry || '',
    workMode: workMode || '',
    location: location || '',
    skill: skill || '',
    sort: sort || 'recommended',
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/referrals/opportunities/:id
 * Get single referral opportunity details
 */
const getReferralOpportunityByIdHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentUserId = req.user?.role === 'STUDENT' ? req.user.id : null;

  const referral = await getReferralOpportunityById(id, studentUserId);

  res.status(200).json({
    success: true,
    data: referral,
  });
});

/**
 * POST /api/referrals/opportunities
 * Create a new referral opportunity (Verified Alumni)
 */
const createReferralOpportunityHandler = asyncHandler(async (req, res) => {
  const opportunity = await createReferralOpportunity(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Referral opportunity created successfully.',
    data: opportunity,
  });
});

/**
 * PUT /api/referrals/opportunities/:id
 * Update referral opportunity (Owner Alumni)
 */
const updateReferralOpportunityHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await updateReferralOpportunity(id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Referral opportunity updated successfully.',
    data: updated,
  });
});

/**
 * PATCH /api/referrals/opportunities/:id/status
 * Update referral opportunity status (OPEN, CLOSED, ARCHIVED)
 */
const updateReferralOpportunityStatusHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new BadRequestError('Status is required.');
  }

  const updated = await updateReferralOpportunityStatus(id, req.user.id, status);

  res.status(200).json({
    success: true,
    message: `Referral opportunity status updated to ${status}.`,
    data: updated,
  });
});

/**
 * GET /api/referrals/alumni/my
 * Get all opportunities created by current alumni
 */
const getMyAlumniReferralsHandler = asyncHandler(async (req, res) => {
  const opportunities = await getAlumniReferralOpportunities(req.user.id);

  res.status(200).json({
    success: true,
    data: opportunities,
  });
});

/**
 * POST /api/referrals/opportunities/:id/request
 * Submit referral request (Student)
 */
const submitReferralRequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { requestMessage, resumeUrl } = req.body;

  const request = await submitReferralRequest(req.user.id, id, {
    requestMessage: requestMessage || '',
    resumeUrl: resumeUrl || '',
  });

  // Notify alumni of new referral request
  try {
    if (request.alumniId) {
      createNotification({
        recipientId: request.alumniId,
        type: 'REFERRAL_REQUEST_RECEIVED',
        title: 'New Referral Request',
        message: `${req.user.name} requested an internal referral from you.`,
        relatedEntityType: 'ReferralRequest',
        relatedEntityId: request._id || request.id,
        actionUrl: '/alumni/referrals',
      }).catch((err) => console.error('[Notification] Error creating referral request notification:', err.message));
    }
  } catch (notifErr) {
    console.error('[Notification] Referral request trigger error:', notifErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Referral request submitted successfully.',
    data: request,
  });
});

/**
 * GET /api/referrals/my-requests
 * Get all referral requests made by current student
 */
const getMyReferralRequestsHandler = asyncHandler(async (req, res) => {
  const requests = await getStudentReferralRequests(req.user.id);

  res.status(200).json({
    success: true,
    data: requests,
  });
});

/**
 * GET /api/referrals/alumni/requests
 * Get all requests across all opportunities for current alumni
 */
const getAllAlumniRequestsHandler = asyncHandler(async (req, res) => {
  const requests = await getAllIncomingRequestsForAlumni(req.user.id);

  res.status(200).json({
    success: true,
    data: requests,
  });
});

/**
 * GET /api/referrals/alumni/opportunities/:id/requests
 * Get requests for a specific opportunity (Owner Alumni)
 */
const getOpportunityRequestsHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requests = await getOpportunityRequestsForAlumni(id, req.user.id);

  res.status(200).json({
    success: true,
    data: requests,
  });
});

/**
 * PATCH /api/referrals/requests/:id/accept
 * Accept referral request (Alumni)
 */
const acceptRequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { responseMessage } = req.body;

  const updated = await acceptReferralRequest(id, req.user.id, { responseMessage });

  // Notify student of accepted referral request
  try {
    createNotification({
      recipientId: updated.studentId,
      type: 'REFERRAL_REQUEST_ACCEPTED',
      title: 'Referral Request Accepted',
      message: `${req.user.name} accepted your referral request!`,
      relatedEntityType: 'ReferralRequest',
      relatedEntityId: id,
      actionUrl: `/student/referrals/${updated.referralOpportunityId || ''}`,
    }).catch((err) => console.error('[Notification] Error creating referral accept notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Referral accept trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Referral request accepted.',
    data: updated,
  });
});

/**
 * PATCH /api/referrals/requests/:id/reject
 * Reject referral request (Alumni)
 */
const rejectRequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { responseMessage } = req.body;

  const updated = await rejectReferralRequest(id, req.user.id, { responseMessage });

  // Notify student of declined referral request
  try {
    createNotification({
      recipientId: updated.studentId,
      type: 'REFERRAL_REQUEST_REJECTED',
      title: 'Referral Request Declined',
      message: `${req.user.name} was unable to provide a referral at this time.${responseMessage ? ` Note: "${responseMessage}"` : ''}`,
      relatedEntityType: 'ReferralRequest',
      relatedEntityId: id,
      actionUrl: `/student/referrals/${updated.referralOpportunityId || ''}`,
    }).catch((err) => console.error('[Notification] Error creating referral reject notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Referral reject trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Referral request rejected.',
    data: updated,
  });
});

/**
 * PATCH /api/referrals/requests/:id/withdraw
 * Withdraw referral request (Student)
 */
const withdrawRequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await withdrawReferralRequest(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Referral request withdrawn.',
    data: updated,
  });
});

/**
 * PATCH /api/referrals/requests/:id/referred
 * Mark request as referred (Alumni)
 */
const markAsReferredHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { responseMessage } = req.body;

  const updated = await markRequestAsReferred(id, req.user.id, { responseMessage });

  // Notify student that referral was submitted
  try {
    createNotification({
      recipientId: updated.studentId,
      type: 'REFERRAL_REFERRED',
      title: 'Referral Submitted!',
      message: `Congratulations! ${req.user.name} has officially submitted your referral to the company!`,
      relatedEntityType: 'ReferralRequest',
      relatedEntityId: id,
      actionUrl: `/student/referrals/${updated.referralOpportunityId || ''}`,
    }).catch((err) => console.error('[Notification] Error creating referral submitted notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Referral submitted trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Candidate marked as referred to the company.',
    data: updated,
  });
});

/**
 * PATCH /api/referrals/requests/:id/complete
 * Complete referral workflow (Student or Alumni)
 */
const completeRequestHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await completeReferralRequest(id, req.user.id);

  // Notify the other party
  try {
    const isStudent = String(req.user.id) === String(updated.studentId);
    const targetRecipient = isStudent ? updated.alumniId : updated.studentId;
    createNotification({
      recipientId: targetRecipient,
      type: 'REFERRAL_COMPLETED',
      title: 'Referral Process Completed',
      message: `Your referral process with ${req.user.name} has been marked as completed.`,
      relatedEntityType: 'ReferralRequest',
      relatedEntityId: id,
      actionUrl: isStudent ? '/alumni/referrals' : '/student/referrals',
    }).catch((err) => console.error('[Notification] Error creating referral complete notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Referral complete trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Referral process marked as completed.',
    data: updated,
  });
});

/**
 * PATCH /api/referrals/requests/:id/outcome
 * Update referral outcome (Student or Alumni)
 */
const updateOutcomeHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { outcome, outcomeNote } = req.body;

  if (!outcome) {
    throw new BadRequestError('Outcome is required.');
  }

  const updated = await updateReferralOutcome(id, req.user.id, {
    outcome,
    outcomeNote,
  });

  res.status(200).json({
    success: true,
    message: 'Referral outcome updated.',
    data: updated,
  });
});

module.exports = {
  getReferralOpportunitiesHandler,
  getReferralOpportunityByIdHandler,
  createReferralOpportunityHandler,
  updateReferralOpportunityHandler,
  updateReferralOpportunityStatusHandler,
  getMyAlumniReferralsHandler,
  submitReferralRequestHandler,
  getMyReferralRequestsHandler,
  getAllAlumniRequestsHandler,
  getOpportunityRequestsHandler,
  acceptRequestHandler,
  rejectRequestHandler,
  withdrawRequestHandler,
  markAsReferredHandler,
  completeRequestHandler,
  updateOutcomeHandler,
};
