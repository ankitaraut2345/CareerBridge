const mongoose = require('mongoose');
const InterviewPreparation = require('../models/InterviewPreparation.model');

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory array for offline development/testing
const memoryInterviewPreps = [];

/**
 * Save or update interview preparation guide
 */
const saveInterviewPreparation = async ({
  studentId,
  opportunityId,
  companyName = '',
  roleTitle = '',
  overview,
  focusAreas = [],
  technicalQuestions = [],
  projectQuestions = [],
  hrQuestions = [],
  preparationTips = [],
  hasScheduledInterview = false,
  scheduledInterviewRound = '',
}) => {
  const payload = {
    companyName,
    roleTitle,
    overview,
    focusAreas,
    technicalQuestions,
    projectQuestions,
    hrQuestions,
    preparationTips,
    hasScheduledInterview,
    scheduledInterviewRound,
    updatedAt: new Date(),
  };

  const sId = String(studentId);
  const oId = String(opportunityId);

  if (
    isDbConnected() &&
    mongoose.Types.ObjectId.isValid(studentId) &&
    mongoose.Types.ObjectId.isValid(opportunityId)
  ) {
    const doc = await InterviewPreparation.findOneAndUpdate(
      { studentId, opportunityId },
      { ...payload, studentId, opportunityId },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    return { ...doc, id: doc._id.toString() };
  }

  // Memory fallback
  const existingIdx = memoryInterviewPreps.findIndex(
    (p) => String(p.studentId) === sId && String(p.opportunityId) === oId
  );

  if (existingIdx !== -1) {
    const updated = {
      ...memoryInterviewPreps[existingIdx],
      ...payload,
      studentId: sId,
      opportunityId: oId,
    };
    memoryInterviewPreps[existingIdx] = updated;
    return { ...updated };
  } else {
    const newDoc = {
      _id: `prep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      id: `prep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studentId: sId,
      opportunityId: oId,
      ...payload,
      createdAt: new Date(),
    };
    memoryInterviewPreps.push(newDoc);
    return { ...newDoc };
  }
};

/**
 * Find latest interview preparation guide for a student and opportunity
 */
const findLatestInterviewPreparation = async (studentId, opportunityId) => {
  const sId = String(studentId);
  const oId = String(opportunityId);

  if (
    isDbConnected() &&
    mongoose.Types.ObjectId.isValid(studentId) &&
    mongoose.Types.ObjectId.isValid(opportunityId)
  ) {
    const doc = await InterviewPreparation.findOne({ studentId, opportunityId })
      .sort({ updatedAt: -1 })
      .lean();
    if (doc) {
      return { ...doc, id: doc._id.toString() };
    }
  }

  const mem = memoryInterviewPreps
    .filter((p) => String(p.studentId) === sId && String(p.opportunityId) === oId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  return mem ? { ...mem } : null;
};

module.exports = {
  saveInterviewPreparation,
  findLatestInterviewPreparation,
  isDbConnected,
};
