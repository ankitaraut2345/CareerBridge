const asyncHandler = require('express-async-handler');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/error');
const { findProfileByUserId } = require('../services/studentProfileStore.service');
const { findOpportunityById } = require('../services/opportunityStore.service');
const { performAiResumeAnalysis } = require('../services/aiResumeAnalysisService');
const {
  saveAnalysis,
  findLatestAnalysis,
  findStudentAnalyses,
} = require('../services/resumeAnalysisStore.service');
const { findExistingApplication } = require('../services/applicationStore.service');
const { generateInterviewPreparation } = require('../services/aiInterviewPrepService');
const {
  saveInterviewPreparation,
  findLatestInterviewPreparation,
} = require('../services/interviewPreparationStore.service');

// Active analysis locks to prevent double-clicks & concurrent duplicate calls
const activeAnalysisLocks = new Set();
const activeInterviewLocks = new Set();

/**
 * POST /api/ai/resume-analysis
 * Analyze current student's resume against a specific opportunity
 */
const analyzeResume = asyncHandler(async (req, res) => {
  const { opportunityId, forceReanalyze } = req.body;

  if (!opportunityId) {
    throw new BadRequestError('Opportunity ID is required');
  }

  const userId = req.user.id;
  const lockKey = `${userId}_${opportunityId}`;

  // Prevent duplicate concurrent requests
  if (activeAnalysisLocks.has(lockKey)) {
    return res.status(429).json({
      success: false,
      message: 'Analysis already in progress. Please wait a moment.',
    });
  }

  // 1. Verify opportunity exists and is accessible
  const opportunity = await findOpportunityById(opportunityId);
  if (!opportunity) {
    throw new NotFoundError('Opportunity not found');
  }

  // Student can only analyze published or non-draft opportunities
  if (opportunity.status === 'DRAFT') {
    throw new ForbiddenError('This opportunity is not currently available for analysis');
  }

  // 2. Fetch authenticated student profile and verify resume
  const profile = await findProfileByUserId(userId);
  if (!profile || !profile.resume || !profile.resume.url) {
    return res.status(400).json({
      success: false,
      code: 'NO_RESUME',
      message: 'Upload your resume first. To use AI Resume Analysis, upload a PDF resume from your profile.',
    });
  }

  // 3. Cache reuse: If recently analyzed with the same resume & not forcing reanalyze
  if (!forceReanalyze) {
    const existing = await findLatestAnalysis(
      userId,
      opportunityId,
      profile.resume.uploadedAt,
      opportunity.updatedAt
    );

    if (existing && !existing.isStale) {
      const ageMinutes = (Date.now() - new Date(existing.updatedAt).getTime()) / (1000 * 60);
      // Reuse if analyzed within the last 30 minutes
      if (ageMinutes < 30) {
        return res.status(200).json({
          success: true,
          cached: true,
          message: 'Retrieved recent analysis result',
          data: existing,
        });
      }
    }
  }

  try {
    activeAnalysisLocks.add(lockKey);

    // 4. Perform AI analysis
    const aiResult = await performAiResumeAnalysis({
      resumeUrl: profile.resume.url,
      studentProfile: profile,
      opportunity,
    });

    // 5. Persist analysis snapshot without storing raw resume text
    const saved = await saveAnalysis({
      studentId: userId,
      opportunityId,
      matchScore: aiResult.matchScore,
      summary: aiResult.summary,
      matchingSkills: aiResult.matchingSkills,
      missingSkills: aiResult.missingSkills,
      strengths: aiResult.strengths,
      improvementSuggestions: aiResult.improvementSuggestions,
      keywordSuggestions: aiResult.keywordSuggestions,
      projectSuggestions: aiResult.projectSuggestions,
      resumeOriginalName: profile.resume.originalName || 'Resume.pdf',
      resumeUpdatedAt: profile.resume.uploadedAt || new Date(),
      opportunityUpdatedAt: opportunity.updatedAt || new Date(),
    });

    res.status(200).json({
      success: true,
      cached: false,
      message: 'Resume analysis generated successfully',
      data: saved,
    });
  } finally {
    activeAnalysisLocks.delete(lockKey);
  }
});

/**
 * GET /api/ai/resume-analysis/:opportunityId
 * Get existing or cached analysis for an opportunity
 */
const getResumeAnalysis = asyncHandler(async (req, res) => {
  const { opportunityId } = req.params;
  const userId = req.user.id;

  if (!opportunityId) {
    throw new BadRequestError('Opportunity ID is required');
  }

  const opportunity = await findOpportunityById(opportunityId);
  if (!opportunity) {
    throw new NotFoundError('Opportunity not found');
  }

  const profile = await findProfileByUserId(userId);
  const currentResumeDate = profile?.resume?.uploadedAt;
  const currentOppDate = opportunity?.updatedAt;

  const analysis = await findLatestAnalysis(
    userId,
    opportunityId,
    currentResumeDate,
    currentOppDate
  );

  res.status(200).json({
    success: true,
    data: analysis || null,
    hasResume: Boolean(profile?.resume?.url),
  });
});

/**
 * GET /api/ai/resume-analyses
 * Get list of previous analyses for current student
 */
const getStudentAnalyses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const list = await findStudentAnalyses(userId, 20);

  res.status(200).json({
    success: true,
    data: list,
  });
});

/**
 * POST /api/ai/interview-preparation (Phase 14)
 * Generate tailored interview preparation guide for student and opportunity
 */
const prepareInterview = asyncHandler(async (req, res) => {
  const { opportunityId, forceRegenerate } = req.body;

  if (!opportunityId) {
    throw new BadRequestError('Opportunity ID is required');
  }

  const userId = req.user.id;
  const lockKey = `${userId}_${opportunityId}`;

  // Prevent duplicate concurrent requests / rapid double clicks
  if (activeInterviewLocks.has(lockKey)) {
    return res.status(429).json({
      success: false,
      message: 'Interview preparation generation in progress. Please wait a moment.',
    });
  }

  // 1. Verify opportunity exists and is accessible
  const opportunity = await findOpportunityById(opportunityId);
  if (!opportunity) {
    throw new NotFoundError('Opportunity not found');
  }

  if (opportunity.status === 'DRAFT') {
    throw new ForbiddenError('This opportunity is not currently available');
  }

  // 2. Fetch authenticated student profile
  const profile = await findProfileByUserId(userId);
  if (!profile) {
    return res.status(400).json({
      success: false,
      code: 'NO_PROFILE',
      message: 'Please complete your student profile before generating interview preparation.',
    });
  }

  // 3. Cache reuse: If recently generated and not forcing regeneration
  if (!forceRegenerate) {
    const existing = await findLatestInterviewPreparation(userId, opportunityId);
    if (existing) {
      const ageMinutes = (Date.now() - new Date(existing.updatedAt).getTime()) / (1000 * 60);
      if (ageMinutes < 60) {
        return res.status(200).json({
          success: true,
          cached: true,
          message: 'Retrieved recent interview preparation guide',
          data: existing,
        });
      }
    }
  }

  // 4. Check if student has applied and has a scheduled interview
  const application = await findExistingApplication(userId, opportunityId);
  const scheduledInterview =
    application?.interview &&
    ['SCHEDULED', 'RESCHEDULED'].includes(application.interview.status)
      ? application.interview
      : null;

  try {
    activeInterviewLocks.add(lockKey);

    // 5. Generate tailored preparation guide
    const prepResult = await generateInterviewPreparation({
      studentProfile: profile,
      opportunity,
      scheduledInterview,
    });

    // 6. Persist preparation guide
    const saved = await saveInterviewPreparation({
      studentId: userId,
      opportunityId,
      companyName: opportunity.companyName,
      roleTitle: opportunity.role || opportunity.title,
      overview: prepResult.overview,
      focusAreas: prepResult.focusAreas,
      technicalQuestions: prepResult.technicalQuestions,
      projectQuestions: prepResult.projectQuestions,
      hrQuestions: prepResult.hrQuestions,
      preparationTips: prepResult.preparationTips,
      hasScheduledInterview: Boolean(scheduledInterview),
      scheduledInterviewRound: scheduledInterview?.round || '',
    });

    res.status(200).json({
      success: true,
      cached: false,
      message: 'Interview preparation guide generated successfully',
      data: saved,
    });
  } finally {
    activeInterviewLocks.delete(lockKey);
  }
});

/**
 * GET /api/ai/interview-preparation/:opportunityId (Phase 14)
 * Retrieve existing interview preparation guide for student
 */
const getInterviewPreparation = asyncHandler(async (req, res) => {
  const { opportunityId } = req.params;
  const userId = req.user.id;

  if (!opportunityId) {
    throw new BadRequestError('Opportunity ID is required');
  }

  const opportunity = await findOpportunityById(opportunityId);
  if (!opportunity) {
    throw new NotFoundError('Opportunity not found');
  }

  const existing = await findLatestInterviewPreparation(userId, opportunityId);
  const profile = await findProfileByUserId(userId);

  // Check application status for any scheduled interview
  const application = await findExistingApplication(userId, opportunityId);
  const scheduledInterview =
    application?.interview &&
    ['SCHEDULED', 'RESCHEDULED'].includes(application.interview.status)
      ? application.interview
      : null;

  res.status(200).json({
    success: true,
    data: existing || null,
    hasProfile: Boolean(profile),
    hasScheduledInterview: Boolean(scheduledInterview),
    scheduledInterviewRound: scheduledInterview?.round || '',
  });
});

module.exports = {
  analyzeResume,
  getResumeAnalysis,
  getStudentAnalyses,
  prepareInterview,
  getInterviewPreparation,
};
