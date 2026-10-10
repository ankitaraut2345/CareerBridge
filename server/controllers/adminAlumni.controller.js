const mongoose = require('mongoose');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');
const { NotFoundError, BadRequestError } = require('../utils/error');
const { isDbConnected, memoryUsers, findUserById } = require('../services/userStore.service');
const { saveAlumniProfile } = require('../services/alumniProfileStore.service');

// GET /api/admin/alumni/pending - list pending alumni
const getPendingAlumni = asyncHandler(async (req, res) => {
  if (isDbConnected()) {
    const pending = await User.find({ role: 'ALUMNI', verificationStatus: 'PENDING' })
      .select('-password -__v')
      .lean();
    return res.status(200).json({ success: true, data: pending });
  }

  const pending = memoryUsers
    .filter((u) => u.role === 'ALUMNI' && u.verificationStatus === 'PENDING')
    .map((u) => {
      const copy = { ...u, id: u._id };
      delete copy.password;
      return copy;
    });

  res.status(200).json({ success: true, data: pending });
});

// PATCH /api/admin/alumni/:id/verification - verify or reject alumni
// body: { status: 'VERIFIED' | 'REJECTED' }
const verifyAlumni = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['VERIFIED', 'REJECTED'].includes(status)) {
    throw new BadRequestError('Invalid verification status');
  }

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const user = await User.findOne({ _id: id, role: 'ALUMNI' });
    if (!user) {
      throw new NotFoundError('Alumni user not found');
    }
    user.verificationStatus = status;
    await user.save();
    await saveAlumniProfile(id, { verificationStatus: status });
    return res.status(200).json({ success: true, data: { id: user._id, verificationStatus: user.verificationStatus } });
  }

  // Memory fallback
  const user = await findUserById(id);
  if (!user || user.role !== 'ALUMNI') {
    throw new NotFoundError('Alumni user not found');
  }
  user.verificationStatus = status;
  await saveAlumniProfile(id, { verificationStatus: status });

  res.status(200).json({ success: true, data: { id: user._id || user.id, verificationStatus: user.verificationStatus } });
});

module.exports = { getPendingAlumni, verifyAlumni };
