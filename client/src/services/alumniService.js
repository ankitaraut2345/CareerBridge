import api from './api';

// ── Alumni Profile ──────────────────────────────────────────────────
export const getAlumniProfile = () => api.get('/alumni/profile');
export const createAlumniProfile = (data) => api.post('/alumni/profile', data);
export const updateAlumniProfile = (data) => api.put('/alumni/profile', data);

// ── Admin – Alumni Verification ────────────────────────────────────
export const getPendingAlumni = () => api.get('/admin/alumni/pending');
export const verifyAlumni = (id, status) =>
  api.patch(`/admin/alumni/${id}/verification`, { status });
