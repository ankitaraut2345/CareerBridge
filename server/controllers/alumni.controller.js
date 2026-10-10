const asyncHandler = require('express-async-handler');
const { BadRequestError, NotFoundError } = require('../utils/error');
const {
  findProfileByUserId,
  saveAlumniProfile,
  isDbConnected,
} = require('../services/alumniProfileStore.service');
const AlumniProfile = require('../models/AlumniProfile.model');

// GET /api/alumni/profile - get current alumni's profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await findProfileByUserId(req.user.id);
  if (!profile) {
    return res.status(200).json({ success: true, data: null, message: 'Profile not found' });
  }
  res.status(200).json({ success: true, data: profile });
});

// Protected fields that alumni users cannot alter
const FORBIDDEN_ALUMNI_FIELDS = [
  'userId',
  '_id',
  'verificationStatus',
  'role',
  'isActive',
  'createdAt',
  'updatedAt',
];

const sanitizeAlumniUpdates = (body) => {
  const clean = { ...body };
  for (const field of FORBIDDEN_ALUMNI_FIELDS) {
    delete clean[field];
  }
  return clean;
};

// POST /api/alumni/profile - create profile if not exists
const createProfile = asyncHandler(async (req, res) => {
  const existing = await findProfileByUserId(req.user.id);
  if (existing) {
    throw new BadRequestError('Profile already exists');
  }
  const updates = sanitizeAlumniUpdates(req.body);
  const profile = await saveAlumniProfile(req.user.id, updates);
  res.status(201).json({ success: true, data: profile });
});

// PUT /api/alumni/profile - update existing profile
const updateProfile = asyncHandler(async (req, res) => {
  const existing = await findProfileByUserId(req.user.id);
  const updates = sanitizeAlumniUpdates(req.body);

  // If mentorship availability or areas updated, sanitize
  if (updates.mentorshipAvailable !== undefined) {
    updates.mentorshipAvailable = Boolean(updates.mentorshipAvailable);
  }
  if (Array.isArray(updates.mentorshipAreas)) {
    updates.mentorshipAreas = updates.mentorshipAreas.map((a) => String(a).trim()).filter(Boolean);
  } else if (typeof updates.mentorshipAreas === 'string') {
    updates.mentorshipAreas = updates.mentorshipAreas.split(',').map((a) => a.trim()).filter(Boolean);
  }

  const profile = await saveAlumniProfile(req.user.id, updates);
  res.status(200).json({ success: true, data: profile });
});

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
};
