const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getAlumniDashboard,
  getTpoDashboard,
  getAdminDashboard,
} = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All dashboard endpoints require authentication
router.use(authenticate);

// Student Dashboard: Role STUDENT only
router.get('/student', authorize('STUDENT'), getStudentDashboard);

// Alumni Dashboard: Role ALUMNI only
router.get('/alumni', authorize('ALUMNI'), getAlumniDashboard);

// TPO Dashboard: Role TPO or ADMIN
router.get('/tpo', authorize('TPO', 'ADMIN'), getTpoDashboard);

// Admin Dashboard: Role ADMIN only
router.get('/admin', authorize('ADMIN'), getAdminDashboard);

module.exports = router;
