import api from './api';

/**
 * Fetch Student Career Dashboard metrics & analytics
 */
export const getStudentDashboard = async () => {
  const response = await api.get('/dashboard/student');
  return response.data;
};

/**
 * Fetch Alumni Mentorship & Referral Dashboard metrics
 */
export const getAlumniDashboard = async () => {
  const response = await api.get('/dashboard/alumni');
  return response.data;
};

/**
 * Fetch TPO Placement & Recruitment Analytics Dashboard
 */
export const getTpoDashboard = async () => {
  const response = await api.get('/dashboard/tpo');
  return response.data;
};

/**
 * Fetch Admin Institutional Governance Dashboard
 */
export const getAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin');
  return response.data;
};

export default {
  getStudentDashboard,
  getAlumniDashboard,
  getTpoDashboard,
  getAdminDashboard,
};
