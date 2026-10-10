const express = require('express');
const router = express.Router();
const {
  getMyApplicationsHandler,
  getApplicationByIdHandler,
  withdrawApplicationHandler,
  updateApplicationStatusHandler,
  scheduleInterviewHandler,
  updateInterviewHandler,
  cancelInterviewHandler,
} = require('../controllers/application.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Protect all application routes with authentication
router.use(authenticate);

// Student: View own submitted applications
router.get('/my', authorize('STUDENT'), getMyApplicationsHandler);

// Student / TPO / Admin: View single application details
router.get('/:id', getApplicationByIdHandler);

// Student: Withdraw application
router.patch('/:id/withdraw', authorize('STUDENT'), withdrawApplicationHandler);

// TPO / Admin: Update application status (Phase 7)
router.patch('/:id/status', authorize('TPO', 'ADMIN'), updateApplicationStatusHandler);

// TPO / Admin: Interview lifecycle (Phase 7)
router.post('/:id/interview', authorize('TPO', 'ADMIN'), scheduleInterviewHandler);
router.put('/:id/interview', authorize('TPO', 'ADMIN'), updateInterviewHandler);
router.delete('/:id/interview', authorize('TPO', 'ADMIN'), cancelInterviewHandler);

module.exports = router;
