import api from './api';

/**
 * Mentorship API Service
 */

// 1. Discover verified mentors with query filters & matching
export const getMentors = (params = {}) =>
  api.get('/mentorship/mentors', { params });

// 2. Get single mentor public details + current user's relationship status
export const getMentorById = (id) =>
  api.get(`/mentorship/mentors/${id}`);

// 3. Request mentorship (STUDENT)
export const requestMentorship = (data) =>
  api.post('/mentorship/request', data);

// 4. Get student's mentorships (STUDENT)
export const getStudentMentorships = () =>
  api.get('/mentorship/student');

// 5. Get alumni incoming requests and active mentees (ALUMNI)
export const getAlumniRequests = () =>
  api.get('/mentorship/alumni/requests');

// 6. Accept request (ALUMNI)
export const acceptMentorship = (id) =>
  api.patch(`/mentorship/${id}/accept`);

// 7. Reject request (ALUMNI)
export const rejectMentorship = (id, data = {}) =>
  api.patch(`/mentorship/${id}/reject`, data);

// 8. Mark mentorship completed (STUDENT or ALUMNI)
export const completeMentorship = (id) =>
  api.patch(`/mentorship/${id}/complete`);

// 9. Cancel mentorship (STUDENT or ALUMNI)
export const cancelMentorship = (id) =>
  api.patch(`/mentorship/${id}/cancel`);
