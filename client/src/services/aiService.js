import api from './api';

/**
 * AI Resume Analysis API Service
 * Handles resume matching and advisory analysis requests for students.
 */

export const analyzeResume = (opportunityId, forceReanalyze = false) => {
  return api.post(
    '/ai/resume-analysis',
    { opportunityId, forceReanalyze },
    { timeout: 25000 } // Extended timeout for LLM generation
  );
};

export const getResumeAnalysis = (opportunityId) => {
  return api.get(`/ai/resume-analysis/${opportunityId}`);
};

export const getStudentAnalyses = () => {
  return api.get('/ai/resume-analyses');
};

// ── Phase 14: AI Interview Preparation ─────────────────────────────────
export const prepareInterview = (opportunityId, forceRegenerate = false) => {
  return api.post(
    '/ai/interview-preparation',
    { opportunityId, forceRegenerate },
    { timeout: 30000 } // Extended timeout for multi-section LLM interview generation
  );
};

export const getInterviewPreparation = (opportunityId) => {
  return api.get(`/ai/interview-preparation/${opportunityId}`);
};

// ── AI Career Assistant Chat ──────────────────────────────────────────
export const chatCareerAssistant = (message) => {
  return api.post('/ai/chat', { message }, { timeout: 20000 });
};

export default {
  analyzeResume,
  getResumeAnalysis,
  getStudentAnalyses,
  prepareInterview,
  getInterviewPreparation,
  chatCareerAssistant,
};
