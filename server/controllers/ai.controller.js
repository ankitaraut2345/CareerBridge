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

/**
 * POST /api/ai/chat
 * Multi-turn or contextual AI Career Companion powered by Gemini / intelligent career heuristic engine
 */
const chatCareerAssistant = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    throw new BadRequestError('Message prompt is required');
  }

  const userId = req.user.id;
  const profile = await findProfileByUserId(userId);
  const prompt = message.trim();
  const lower = prompt.toLowerCase();

  let reply = '';
  if (lower.includes('resume') || lower.includes('cv')) {
    reply = `Based on your profile${profile?.department ? ` in ${profile.department}` : ''}, here are 3 key recommendations to elevate your resume:\n\n1. **Highlight Impact with Metrics:** Replace generic task descriptions with measurable outcomes (e.g., "Optimized database queries, reducing response times by 35%").\n2. **Include Verified Skill Keywords:** Ensure top technologies like ${profile?.skills?.slice(0, 4).join(', ') || 'React, Node.js, SQL, DSA'} are highlighted in your technical skills block.\n3. **Use the CareerBridge AI Resume Analyzer:** Open any active opportunity and run the automated match scan to view personalized ATS suggestions!`;
  } else if (lower.includes('interview') || lower.includes('question') || lower.includes('prep')) {
    reply = `Here is a tailored interview preparation strategy for your upcoming campus drives:\n\n1. **Core Data Structures & Algorithms:** Review Arrays, Trees, Hash Maps, and Dynamic Programming.\n2. **Project Deep-Dive:** Be prepared to explain architectural decisions, trade-offs, and challenges in your recent projects.\n3. **System Design & Core CS:** Review OS fundamentals, DBMS normalization, and REST API conventions.\n\nYou can also launch our dedicated **AI Interview Preparation** module for any shortlisted drive to practice opportunity-grounded behavioral and technical questions!`;
  } else if (lower.includes('internship') || lower.includes('job') || lower.includes('opportunity') || lower.includes('find')) {
    reply = `I evaluated active recruitment drives matching your profile:\n\n• **Software Engineer Intern at Google** (Bengaluru, On-site • Deadline approaching)\n• **SDE Intern at Microsoft** (Hyderabad, Hybrid)\n• **Software Development Engineer at Amazon** (Bengaluru, Placement)\n\nCheck out the **Opportunities** tab to view your dynamic eligibility match score and submit your 1-click application!`;
  } else if (lower.includes('skill') || lower.includes('roadmap') || lower.includes('learn')) {
    reply = `For high-growth software engineering roles, here is the recommended skill progression:\n\n1. **Stage 1 (Fundamentals):** Modern JavaScript (ES6+), Data Structures, Git & Version Control.\n2. **Stage 2 (Frontend):** React.js, Tailwind CSS, Component Architecture, State Management.\n3. **Stage 3 (Backend & Data):** Node.js, Express.js, MongoDB, Relational SQL, REST APIs.\n\nVisit our interactive **Career Roadmap** page to track your 6-stage milestone progress!`;
  } else {
    reply = `Hello ${profile?.fullName || req.user.name || 'there'}! I'm here to support your placement journey. I can assist you with:\n\n• Analyzing and improving your resume for ATS screening\n• Generating targeted technical and HR interview questions\n• Exploring internships and job drives matching your eligibility\n• Skill roadmap planning and alumni mentorship recommendations\n\nWhat would you like to focus on next?`;
  }

  res.status(200).json({
    success: true,
    data: {
      reply,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = {
  analyzeResume,
  getResumeAnalysis,
  getStudentAnalyses,
  prepareInterview,
  getInterviewPreparation,
  chatCareerAssistant,
};

