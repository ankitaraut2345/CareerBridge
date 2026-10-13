const asyncHandler = require('express-async-handler');
const {
  discoverMentors,
  getMentorDetails,
  createMentorshipRequest,
  getStudentMentorships,
  getAlumniMentorships,
  acceptMentorship,
  rejectMentorship,
  completeMentorship,
  cancelMentorship,
} = require('../services/mentorshipStore.service');
const { BadRequestError } = require('../utils/error');
const { createNotification } = require('../services/notificationStore.service');

/**
 * GET /api/mentorship/mentors
 * Student/Alumni/Admin discover verified mentors with profile match scores & filters
 */
const getMentorsHandler = asyncHandler(async (req, res) => {
  const {
    search,
    company,
    industry,
    department,
    location,
    graduationYear,
    availability,
    area,
    skill,
    minExp,
    sort,
  } = req.query;

  const studentUserId = req.user?.role === 'STUDENT' ? req.user.id : null;

  const result = await discoverMentors({
    studentUserId,
    search: search || '',
    company: company || '',
    industry: industry || '',
    department: department || '',
    location: location || '',
    graduationYear: graduationYear || '',
    availability: availability || '',
    area: area || '',
    skill: skill || '',
    minExp: minExp || '',
    sort: sort || 'recommended',
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/mentorship/mentors/:id
 * Get single mentor public details + current user's existing mentorship status
 */
const getMentorByIdHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentUserId = req.user?.role === 'STUDENT' ? req.user.id : null;

  const mentor = await getMentorDetails(id, studentUserId);

  res.status(200).json({
    success: true,
    data: mentor,
  });
});

/**
 * POST /api/mentorship/request
 * Student requests mentorship from a verified alumnus
 */
const requestMentorshipHandler = asyncHandler(async (req, res) => {
  const { alumniId, requestMessage, mentorshipAreas } = req.body;

  if (!alumniId) {
    throw new BadRequestError('alumniId is required to request mentorship.');
  }

  const record = await createMentorshipRequest({
    studentId: req.user.id,
    alumniId,
    requestMessage: requestMessage || '',
    mentorshipAreas: mentorshipAreas || [],
  });

  // Notify alumni of new request
  try {
    createNotification({
      recipientId: alumniId,
      type: 'MENTORSHIP_REQUEST_RECEIVED',
      title: 'New Mentorship Request',
      message: `${req.user.name} has requested mentorship from you.`,
      relatedEntityType: 'Mentorship',
      relatedEntityId: record._id || record.id,
      actionUrl: '/alumni/mentorship',
    }).catch((err) => console.error('[Notification] Error creating mentorship request notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Mentorship request trigger error:', notifErr.message);
  }

  res.status(201).json({
    success: true,
    message: 'Mentorship request submitted successfully.',
    data: record,
  });
});

/**
 * GET /api/mentorship/student
 * Student views own mentorship requests and active/past relationships
 */
const getStudentMentorshipsHandler = asyncHandler(async (req, res) => {
  const records = await getStudentMentorships(req.user.id);

  res.status(200).json({
    success: true,
    data: records,
  });
});

/**
 * GET /api/mentorship/alumni/requests
 * Alumni views incoming requests and active/past mentees
 */
const getAlumniRequestsHandler = asyncHandler(async (req, res) => {
  const records = await getAlumniMentorships(req.user.id);

  res.status(200).json({
    success: true,
    data: records,
  });
});

/**
 * PATCH /api/mentorship/:id/accept
 * Alumni accepts a pending mentorship request
 */
const acceptMentorshipHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await acceptMentorship(id, req.user.id);

  // Notify student of accepted mentorship
  try {
    createNotification({
      recipientId: updated.studentId,
      type: 'MENTORSHIP_REQUEST_ACCEPTED',
      title: 'Mentorship Request Accepted',
      message: `${req.user.name} accepted your mentorship request!`,
      relatedEntityType: 'Mentorship',
      relatedEntityId: id,
      actionUrl: '/student/mentorship',
    }).catch((err) => console.error('[Notification] Error creating mentorship accept notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Mentorship accept trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Mentorship request accepted.',
    data: updated,
  });
});

/**
 * PATCH /api/mentorship/:id/reject
 * Alumni rejects a pending request with optional message
 */
const rejectMentorshipHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { responseMessage } = req.body;

  const updated = await rejectMentorship(id, req.user.id, responseMessage);

  // Notify student of declined mentorship
  try {
    createNotification({
      recipientId: updated.studentId,
      type: 'MENTORSHIP_REQUEST_REJECTED',
      title: 'Mentorship Request Declined',
      message: `${req.user.name} was unable to accept your mentorship request.${responseMessage ? ` Note: "${responseMessage}"` : ''}`,
      relatedEntityType: 'Mentorship',
      relatedEntityId: id,
      actionUrl: '/student/mentorship',
    }).catch((err) => console.error('[Notification] Error creating mentorship reject notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Mentorship reject trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Mentorship request rejected.',
    data: updated,
  });
});

/**
 * PATCH /api/mentorship/:id/complete
 * Participant (Student or Alumni) marks mentorship as completed
 */
const completeMentorshipHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await completeMentorship(id, req.user.id);

  // Notify the other participant
  try {
    const isStudent = String(req.user.id) === String(updated.studentId);
    const targetRecipient = isStudent ? updated.alumniId : updated.studentId;
    createNotification({
      recipientId: targetRecipient,
      type: 'MENTORSHIP_COMPLETED',
      title: 'Mentorship Completed',
      message: `Your mentorship with ${req.user.name} has been marked as completed.`,
      relatedEntityType: 'Mentorship',
      relatedEntityId: id,
      actionUrl: isStudent ? '/alumni/mentorship' : '/student/mentorship',
    }).catch((err) => console.error('[Notification] Error creating mentorship complete notification:', err.message));
  } catch (notifErr) {
    console.error('[Notification] Mentorship complete trigger error:', notifErr.message);
  }

  res.status(200).json({
    success: true,
    message: 'Mentorship successfully marked as completed.',
    data: updated,
  });
});

/**
 * PATCH /api/mentorship/:id/cancel
 * Participant (Student or Alumni) cancels active or pending mentorship
 */
const cancelMentorshipHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await cancelMentorship(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Mentorship cancelled.',
    data: updated,
  });
});

module.exports = {
  getMentorsHandler,
  getMentorByIdHandler,
  requestMentorshipHandler,
  getStudentMentorshipsHandler,
  getAlumniRequestsHandler,
  acceptMentorshipHandler,
  rejectMentorshipHandler,
  completeMentorshipHandler,
  cancelMentorshipHandler,
};
