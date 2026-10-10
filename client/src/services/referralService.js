import api from './api';

/**
 * Referral API Service
 */

// 1. Discover referral opportunities (STUDENT / ALL)
export const getReferralOpportunities = (params = {}) =>
  api.get('/referrals/opportunities', { params });

// 2. Get single referral opportunity details by ID
export const getReferralOpportunityById = (id) =>
  api.get(`/referrals/opportunities/${id}`);

// 3. Create a new referral opportunity (ALUMNI)
export const createReferralOpportunity = (data) =>
  api.post('/referrals/opportunities', data);

// 4. Update referral opportunity (ALUMNI owner)
export const updateReferralOpportunity = (id, data) =>
  api.put(`/referrals/opportunities/${id}`, data);

// 5. Update opportunity status: OPEN, CLOSED, ARCHIVED (ALUMNI owner)
export const updateReferralOpportunityStatus = (id, status) =>
  api.patch(`/referrals/opportunities/${id}/status`, { status });

// 6. Get all referral opportunities posted by logged-in alumni (ALUMNI)
export const getMyAlumniReferrals = () =>
  api.get('/referrals/alumni/my');

// 7. Submit referral request for an opportunity (STUDENT)
export const submitReferralRequest = (id, data) =>
  api.post(`/referrals/opportunities/${id}/request`, data);

// 8. Get current student's referral requests (STUDENT)
export const getMyReferralRequests = () =>
  api.get('/referrals/my-requests');

// 9. Get all incoming requests across all opportunities (ALUMNI)
export const getAllAlumniRequests = () =>
  api.get('/referrals/alumni/requests');

// 10. Get requests for a specific referral opportunity (ALUMNI)
export const getOpportunityRequests = (id) =>
  api.get(`/referrals/alumni/opportunities/${id}/requests`);

// 11. Accept referral request (ALUMNI)
export const acceptReferralRequest = (id, data = {}) =>
  api.patch(`/referrals/requests/${id}/accept`, data);

// 12. Reject referral request (ALUMNI)
export const rejectReferralRequest = (id, data = {}) =>
  api.patch(`/referrals/requests/${id}/reject`, data);

// 13. Withdraw referral request (STUDENT)
export const withdrawReferralRequest = (id) =>
  api.patch(`/referrals/requests/${id}/withdraw`);

// 14. Mark candidate as referred (ALUMNI)
export const markReferralAsReferred = (id, data = {}) =>
  api.patch(`/referrals/requests/${id}/referred`, data);

// 15. Complete referral process (STUDENT or ALUMNI)
export const completeReferralRequest = (id) =>
  api.patch(`/referrals/requests/${id}/complete`);

// 16. Update referral outcome (STUDENT or ALUMNI)
export const updateReferralOutcome = (id, data) =>
  api.patch(`/referrals/requests/${id}/outcome`, data);
