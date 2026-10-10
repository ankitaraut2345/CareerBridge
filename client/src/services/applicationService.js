import api from './api';

/**
 * CareerBridge Application, Eligibility & Interview API Service
 * Manages student eligibility evaluation, application submissions, status lifecycle, and interview scheduling.
 */

// ── Student Eligibility & Application ─────────────────────────────────
export const checkEligibility = (opportunityId) => {
  return api.get(`/opportunities/${opportunityId}/eligibility`);
};

export const applyToOpportunity = (opportunityId, data = {}) => {
  return api.post(`/opportunities/${opportunityId}/apply`, data);
};

export const getMyApplications = (params = {}) => {
  return api.get('/applications/my', { params });
};

export const getApplicationById = (id) => {
  return api.get(`/applications/${id}`);
};

export const withdrawApplication = (id, reason = '') => {
  return api.patch(`/applications/${id}/withdraw`, { reason });
};

// ── Phase 7: Application Status & Interview Management ────────────────
export const updateApplicationStatus = (id, data = {}) => {
  return api.patch(`/applications/${id}/status`, data);
};

export const scheduleInterview = (id, interviewData = {}) => {
  return api.post(`/applications/${id}/interview`, interviewData);
};

export const updateInterview = (id, interviewData = {}) => {
  return api.put(`/applications/${id}/interview`, interviewData);
};

export const cancelInterview = (id, reason = '') => {
  return api.delete(`/applications/${id}/interview`, { data: { reason } });
};

// ── TPO Applicant Management ──────────────────────────────────────────
export const getOpportunityApplicants = (opportunityId, params = {}) => {
  return api.get(`/opportunities/${opportunityId}/applications`, { params });
};

// ── Student Profile Helpers ───────────────────────────────────────────
export const getStudentProfile = () => {
  return api.get('/students/profile');
};

export const updateStudentProfile = (data) => {
  return api.put('/students/profile', data);
};

export default {
  checkEligibility,
  applyToOpportunity,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  updateApplicationStatus,
  scheduleInterview,
  updateInterview,
  cancelInterview,
  getOpportunityApplicants,
  getStudentProfile,
  updateStudentProfile,
};
