const express = require('express');
const router = express.Router();
const {
  getMentorsHandler,
  getMentorByIdHandler,
  requestMentorshipHandler,
  getStudentMentorshipsHandler,
  getAlumniRequestsHandler,
  acceptMentorshipHandler,
  rejectMentorshipHandler,
  completeMentorshipHandler,
  cancelMentorshipHandler,
} = require('../controllers/mentorship.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All mentorship routes require authentication
router.use(authenticate);

// 1. Mentor Discovery & Details (Students, Alumni, Admins can browse)
router.get('/mentors', getMentorsHandler);
router.get('/mentors/:id', getMentorByIdHandler);

// 2. Student Mentorship Actions
router.post('/request', authorize('STUDENT'), requestMentorshipHandler);
router.get('/student', authorize('STUDENT'), getStudentMentorshipsHandler);

// 3. Alumni Mentorship Actions
router.get('/alumni/requests', authorize('ALUMNI'), getAlumniRequestsHandler);
router.patch('/:id/accept', authorize('ALUMNI'), acceptMentorshipHandler);
router.patch('/:id/reject', authorize('ALUMNI'), rejectMentorshipHandler);

// 4. Shared Participant Actions (Student or Alumni)
router.patch('/:id/complete', authorize('STUDENT', 'ALUMNI'), completeMentorshipHandler);
router.patch('/:id/cancel', authorize('STUDENT', 'ALUMNI'), cancelMentorshipHandler);

module.exports = router;
