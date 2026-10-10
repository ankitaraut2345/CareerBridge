const StudentProfile = require('../models/StudentProfile.model');
const asyncHandler = require('express-async-handler');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/error');

// GET /api/students/profile - get current student's profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user.id });
  if (!profile) {
    return res.status(200).json({ success: true, data: null, message: 'Profile not found' });
  }
  res.status(200).json({ success: true, data: profile });
});

// POST /api/students/profile - create profile if not exists
const createProfile = asyncHandler(async (req, res) => {
  const existing = await StudentProfile.findOne({ userId: req.user.id });
  if (existing) {
    throw new BadRequestError('Profile already exists');
  }
  const profile = new StudentProfile({ ...req.body, userId: req.user.id });
  await profile.save();
  res.status(201).json({ success: true, data: profile });
});

// PUT /api/students/profile - update existing profile
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user.id });
  if (!profile) {
    throw new NotFoundError('Profile not found');
  }
  // Prevent userId override
  const updates = { ...req.body };
  delete updates.userId;
  Object.assign(profile, updates);
  await profile.save();
  res.status(200).json({ success: true, data: profile });
});

// DELETE /api/students/profile - remove profile data only (keep user)
const deleteProfile = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ userId: req.user.id });
  if (!profile) {
    throw new NotFoundError('Profile not found');
  }
  await profile.remove();
  res.status(200).json({ success: true, message: 'Profile deleted' });
});

module.exports = {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
};
