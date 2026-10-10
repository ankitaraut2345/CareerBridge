const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/referral.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Protect all referral routes with authentication
router.use(authenticate);

// 1. Referral Opportunities Discovery & Details
router.get('/opportunities', getReferralOpportunitiesHandler);
router.get('/opportunities/:id', getReferralOpportunityByIdHandler);

// 2. Alumni Referral Opportunity Management
router.post('/opportunities', authorize('ALUMNI'), createReferralOpportunityHandler);
router.put('/opportunities/:id', authorize('ALUMNI'), updateReferralOpportunityHandler);
router.patch('/opportunities/:id/status', authorize('ALUMNI'), updateReferralOpportunityStatusHandler);
router.get('/alumni/my', authorize('ALUMNI'), getMyAlumniReferralsHandler);

// 3. Student Request Submission & Tracking
router.post('/opportunities/:id/request', authorize('STUDENT'), submitReferralRequestHandler);
router.get('/my-requests', authorize('STUDENT'), getMyReferralRequestsHandler);

// 4. Alumni Incoming Requests Management
router.get('/alumni/requests', authorize('ALUMNI'), getAllAlumniRequestsHandler);
router.get('/alumni/opportunities/:id/requests', authorize('ALUMNI'), getOpportunityRequestsHandler);

// 5. Request Status Actions
router.patch('/requests/:id/accept', authorize('ALUMNI'), acceptRequestHandler);
router.patch('/requests/:id/reject', authorize('ALUMNI'), rejectRequestHandler);
router.patch('/requests/:id/withdraw', authorize('STUDENT'), withdrawRequestHandler);
router.patch('/requests/:id/referred', authorize('ALUMNI'), markAsReferredHandler);
router.patch('/requests/:id/complete', authorize('STUDENT', 'ALUMNI'), completeRequestHandler);
router.patch('/requests/:id/outcome', authorize('STUDENT', 'ALUMNI'), updateOutcomeHandler);

module.exports = router;
