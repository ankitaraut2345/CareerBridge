const express = require('express');
const router = express.Router();
const { getPendingAlumni, verifyAlumni } = require('../controllers/adminAlumni.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// All admin routes require JWT + ADMIN role
router.use(authenticate, authorize('ADMIN'));

// GET  /api/admin/alumni/pending        — list PENDING alumni
router.get('/alumni/pending', getPendingAlumni);

// PATCH /api/admin/alumni/:id/verification — verify or reject an alumni
router.patch('/alumni/:id/verification', verifyAlumni);

module.exports = router;
