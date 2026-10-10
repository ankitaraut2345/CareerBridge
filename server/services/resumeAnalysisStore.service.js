const mongoose = require('mongoose');
const ResumeAnalysis = require('../models/ResumeAnalysis.model');

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory array for offline development/testing
const memoryAnalyses = [];

/**
 * Save or update resume analysis
 */
const saveAnalysis = async ({
  studentId,
  opportunityId,
  matchScore,
  summary,
  matchingSkills = [],
  missingSkills = [],
  strengths = [],
  improvementSuggestions = [],
  keywordSuggestions = [],
  projectSuggestions = [],
  resumeOriginalName = '',
  resumeUpdatedAt = new Date(),
  opportunityUpdatedAt = new Date(),
}) => {
  const analysisPayload = {
    matchScore: Math.max(0, Math.min(100, Math.round(matchScore))),
    summary,
    matchingSkills,
    missingSkills,
    strengths,
    improvementSuggestions,
    keywordSuggestions,
    projectSuggestions,
    resumeOriginalName,
    resumeUpdatedAt: new Date(resumeUpdatedAt),
    opportunityUpdatedAt: new Date(opportunityUpdatedAt),
    isStale: false,
    updatedAt: new Date(),
  };

  if (
    isDbConnected() &&
    mongoose.Types.ObjectId.isValid(studentId) &&
    mongoose.Types.ObjectId.isValid(opportunityId)
  ) {
    const doc = await ResumeAnalysis.findOneAndUpdate(
      { studentId, opportunityId },
      { ...analysisPayload, studentId, opportunityId },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    return { ...doc, id: doc._id.toString() };
  }

  // Memory fallback
  const sId = String(studentId);
  const oId = String(opportunityId);
  const existingIdx = memoryAnalyses.findIndex(
    (a) => String(a.studentId) === sId && String(a.opportunityId) === oId
  );

  if (existingIdx !== -1) {
    const updated = {
      ...memoryAnalyses[existingIdx],
      ...analysisPayload,
      studentId: sId,
      opportunityId: oId,
    };
    memoryAnalyses[existingIdx] = updated;
    return { ...updated };
  } else {
    const newDoc = {
      _id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studentId: sId,
      opportunityId: oId,
      ...analysisPayload,
      createdAt: new Date(),
    };
    memoryAnalyses.push(newDoc);
    return { ...newDoc };
  }
};

/**
 * Find latest analysis for a student and opportunity
 */
const findLatestAnalysis = async (studentId, opportunityId, currentResumeDate = null, currentOppDate = null) => {
  let doc = null;

  if (
    isDbConnected() &&
    mongoose.Types.ObjectId.isValid(studentId) &&
    mongoose.Types.ObjectId.isValid(opportunityId)
  ) {
    doc = await ResumeAnalysis.findOne({ studentId, opportunityId })
      .sort({ updatedAt: -1 })
      .lean();
    if (doc) {
      doc = { ...doc, id: doc._id.toString() };
    }
  }

  if (!doc) {
    const sId = String(studentId);
    const oId = String(opportunityId);
    const mem = memoryAnalyses
      .filter((a) => String(a.studentId) === sId && String(a.opportunityId) === oId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    if (mem) {
      doc = { ...mem };
    }
  }

  if (!doc) return null;

  // Check staleness against current resume and opportunity dates
  let isStale = false;
  if (currentResumeDate && doc.resumeUpdatedAt) {
    const curResumeTime = new Date(currentResumeDate).getTime();
    const recordedResumeTime = new Date(doc.resumeUpdatedAt).getTime();
    if (curResumeTime > recordedResumeTime + 1000) {
      isStale = true;
    }
  }

  if (currentOppDate && doc.opportunityUpdatedAt) {
    const curOppTime = new Date(currentOppDate).getTime();
    const recordedOppTime = new Date(doc.opportunityUpdatedAt).getTime();
    if (curOppTime > recordedOppTime + 5000) {
      isStale = true;
    }
  }

  doc.isStale = isStale;
  return doc;
};

/**
 * Get recent analyses for student
 */
const findStudentAnalyses = async (studentId, limit = 10) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(studentId)) {
    const list = await ResumeAnalysis.find({ studentId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();
    return list.map((item) => ({ ...item, id: item._id.toString() }));
  }

  const sId = String(studentId);
  return memoryAnalyses
    .filter((a) => String(a.studentId) === sId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
};

module.exports = {
  saveAnalysis,
  findLatestAnalysis,
  findStudentAnalyses,
  isDbConnected,
};
