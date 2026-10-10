const express = require('express');
const router = express.Router();
const { getProfile, createProfile, updateProfile } = require('../controllers/alumni.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Protect all alumni profile routes – must be authenticated as ALUMNI
router.use(authenticate, authorize('ALUMNI'));

router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.put('/profile', updateProfile);

module.exports = router;
