const express = require('express');
const router = express.Router();
const {
  getProfile,
  createProfile,
  updateProfile,
} = require('../controllers/studentProfile.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const {
  findProfileByUserId,
  saveStudentProfile,
} = require('../services/studentProfileStore.service');
const asyncHandler = require('express-async-handler');

// Protect student routes
router.use(authenticate, authorize('STUDENT'));

// Get current student profile (supports DB and memory fallback)
router.get('/profile', asyncHandler(async (req, res) => {
  const profile = await findProfileByUserId(req.user.id);
  res.status(200).json({
    success: true,
    data: profile || null,
  });
}));

const { BadRequestError } = require('../utils/error');

const ALLOWED_STUDENT_FIELDS = [
  'fullName',
  'profilePhoto',
  'phone',
  'location',
  'dateOfBirth',
  'department',
  'college',
  'graduationYear',
  'cgpa',
  'backlogs',
  'bio',
  'skills',
  'projects',
  'certifications',
  'careerInterests',
  'preferredRoles',
  'preferredIndustries',
  'preferredLocations',
  'resume',
];

// Update or save current student profile with field whitelisting & validation
router.put('/profile', asyncHandler(async (req, res) => {
  const updates = {};

  // Strict allowlist: only copy allowed fields
  for (const field of ALLOWED_STUDENT_FIELDS) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  // Validate CGPA
  if (updates.cgpa !== undefined) {
    const num = Number(updates.cgpa);
    if (isNaN(num) || num < 0 || num > 10) {
      throw new BadRequestError('CGPA must be a valid number between 0.0 and 10.0.');
    }
    updates.cgpa = num;
  }

  // Validate backlogs
  if (updates.backlogs !== undefined) {
    const num = Number(updates.backlogs);
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
      throw new BadRequestError('Backlogs must be a non-negative integer.');
    }
    updates.backlogs = num;
  }

  // Validate graduation year
  if (updates.graduationYear !== undefined) {
    const num = Number(updates.graduationYear);
    if (isNaN(num) || num < 2000 || num > 2100) {
      throw new BadRequestError('Graduation year must be a valid 4-digit year.');
    }
    updates.graduationYear = num;
  }

  // Validate resume
  if (updates.resume) {
    if (typeof updates.resume !== 'object' || !updates.resume.url) {
      throw new BadRequestError('Resume must include a valid file URL.');
    }
    if (updates.resume.originalName && !updates.resume.originalName.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestError('Only PDF format resumes are supported.');
    }
    const urlStr = String(updates.resume.url).toLowerCase();
    if (urlStr.startsWith('javascript:') || urlStr.startsWith('data:text/html')) {
      throw new BadRequestError('Insecure or invalid resume URL scheme.');
    }
  }

  const saved = await saveStudentProfile(req.user.id, updates);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: saved,
  });
}));

module.exports = router;
