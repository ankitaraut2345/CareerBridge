const express = require('express');
const router = express.Router();
const {
  analyzeResume,
  getResumeAnalysis,
  getStudentAnalyses,
  prepareInterview,
  getInterviewPreparation,
} = require('../controllers/ai.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Protect all AI routes: authenticated STUDENTS only
router.use(authenticate, authorize('STUDENT'));

// AI Resume Analysis endpoints (Phase 13)
router.post('/resume-analysis', analyzeResume);
router.get('/resume-analysis/:opportunityId', getResumeAnalysis);
router.get('/resume-analyses', getStudentAnalyses);

// AI Interview Preparation endpoints (Phase 14)
router.post('/interview-preparation', prepareInterview);
router.get('/interview-preparation/:opportunityId', getInterviewPreparation);

module.exports = router;
