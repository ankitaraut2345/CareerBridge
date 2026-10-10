const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');

/**
 * Temporary development test routes for verifying RBAC boundaries
 * These confirm that each role can only access their authorized endpoints.
 */

// Student-only endpoint
router.get('/student', authenticate, authorize('STUDENT'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Student RBAC test passed.',
    role: req.user.role,
    user: req.user,
  });
});

// Alumni-only endpoint
router.get('/alumni', authenticate, authorize('ALUMNI'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Alumni RBAC test passed.',
    role: req.user.role,
    user: req.user,
  });
});

// TPO-only endpoint
router.get('/tpo', authenticate, authorize('TPO'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: TPO RBAC test passed.',
    role: req.user.role,
    user: req.user,
  });
});

// Admin-only endpoint
router.get('/admin', authenticate, authorize('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized: Admin RBAC test passed.',
    role: req.user.role,
    user: req.user,
  });
});

module.exports = router;
