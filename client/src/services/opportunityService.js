import api from './api';

/**
 * Opportunity API Service for CareerBridge
 * Handles public browsing, student feeds, and TPO management operations.
 */

// ── Public / Student Browsing ──────────────────────────────────────────
export const getOpportunities = (params = {}) => {
  return api.get('/opportunities', { params });
};

export const getOpportunityById = (id) => {
  return api.get(`/opportunities/${id}`);
};

// ── TPO & Admin Management ─────────────────────────────────────────────
export const getManageOpportunities = (params = {}) => {
  return api.get('/opportunities/manage', { params });
};

export const getOpportunityStats = () => {
  return api.get('/opportunities/stats');
};

export const createOpportunity = (data) => {
  return api.post('/opportunities', data);
};

export const updateOpportunity = (id, data) => {
  return api.put(`/opportunities/${id}`, data);
};

export const updateOpportunityStatus = (id, status) => {
  return api.patch(`/opportunities/${id}/status`, { status });
};

export const deleteOpportunity = (id) => {
  return api.delete(`/opportunities/${id}`);
};

export default {
  getOpportunities,
  getOpportunityById,
  getManageOpportunities,
  getOpportunityStats,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStatus,
  deleteOpportunity,
};
