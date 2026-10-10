const http = require('http');

function request(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const headers = {
      ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
    };
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers,
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const get = (path, token) => request('GET', path, null, token);
const post = (path, data, token) => request('POST', path, data, token);
const patch = (path, data, token) => request('PATCH', path, data, token);
const put = (path, data, token) => request('PUT', path, data, token);

async function runPhase8Suite() {
  console.log('=== CareerBridge Phase 8: Mentorship Test Suite ===\n');
  let passed = 0;
  let total = 0;

  const assert = (condition, title, details = '') => {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] Test ${total}: ${title} ${details ? '— ' + details : ''}`);
    } else {
      console.error(`[FAIL] Test ${total}: ${title} ${details ? '— ' + details : ''}`);
    }
  };

  // 1. Authenticate users
  const studentAuth = await post('/api/auth/login', { email: 'student@demo.com', password: 'demo123' });
  const studentToken = studentAuth.data.token;
  const studentId = studentAuth.data.user.id;

  const alumniAuth = await post('/api/auth/login', { email: 'alumni@demo.com', password: 'demo123' });
  const alumniToken = alumniAuth.data.token;
  const alumniId = alumniAuth.data.user.id;

  // Test 1: Student can view verified available alumni
  const mentorsRes = await get('/api/mentorship/mentors', studentToken);
  const mentors = mentorsRes.data?.data?.mentors || [];
  assert(
    mentorsRes.status === 200 && mentors.length >= 3,
    'Student can view verified available alumni',
    `Found ${mentors.length} mentors`
  );

  // Test 2: Student cannot see unverified alumni as mentors
  const unverifiedInList = mentors.some(m => m.fullName && m.fullName.includes('Pending'));
  assert(
    !unverifiedInList,
    'Student cannot see unverified alumni as mentors',
    'Pending/unverified alumni correctly excluded'
  );

  // Test 3: Student can search mentors
  const searchRes = await get('/api/mentorship/mentors?search=Google', studentToken);
  const searchMentors = searchRes.data?.data?.mentors || [];
  assert(
    searchRes.status === 200 && searchMentors.some(m => m.currentCompany === 'Google'),
    'Student can search mentors by company/skills',
    `Found Google mentor: ${searchMentors[0]?.fullName}`
  );

  // Test 4: Student can filter mentors by mentorship area
  const filterRes = await get('/api/mentorship/mentors?area=DSA', studentToken);
  const filterMentors = filterRes.data?.data?.mentors || [];
  assert(
    filterRes.status === 200 && filterMentors.every(m => m.mentorshipAreas.includes('DSA')),
    'Student can filter mentors by guidance area (DSA)',
    `Filtered ${filterMentors.length} mentors offering DSA`
  );

  // Test 5: Student can view mentor detailed public profile
  const firstMentorId = mentors[0]?.userId || mentors[0]?.id;
  const mentorDetailRes = await get(`/api/mentorship/mentors/${firstMentorId}`, studentToken);
  const mentorDetail = mentorDetailRes.data?.data;
  assert(
    mentorDetailRes.status === 200 && mentorDetail?.fullName === mentors[0]?.fullName && mentorDetail?.matchScore > 0,
    'Student can view mentor detailed profile with match breakdown',
    `${mentorDetail?.fullName} (${mentorDetail?.matchScore}% Profile Match)`
  );

  // Test 6: Student can request mentorship
  const targetAlumniId = 'demo_alumni'; // Priya Sharma at Google
  const reqRes = await post('/api/mentorship/request', {
    alumniId: targetAlumniId,
    requestMessage: 'I am interested in preparing for software engineering placements and distributed systems.',
    mentorshipAreas: ['DSA', 'System Design'],
  }, studentToken);
  const createdMentorship = reqRes.data?.data;
  const mentorshipId = createdMentorship?._id || createdMentorship?.id;
  assert(
    reqRes.status === 201 && createdMentorship?.status === 'PENDING',
    'Student can submit mentorship request',
    `Status: ${createdMentorship?.status}, ID: ${mentorshipId}`
  );

  // Test 7: Student cannot create duplicate active mentorship requests
  const dupReqRes = await post('/api/mentorship/request', {
    alumniId: targetAlumniId,
    requestMessage: 'Duplicate request test',
    mentorshipAreas: ['DSA'],
  }, studentToken);
  assert(
    dupReqRes.status === 400,
    'Student cannot create duplicate active mentorship requests (blocked)',
    `Response: 400 (${dupReqRes.data?.message})`
  );

  // Test 8: Student can view request status
  const studentMentorshipsRes = await get('/api/mentorship/student', studentToken);
  const studentList = studentMentorshipsRes.data?.data || [];
  const foundInStudentList = studentList.find(m => (m._id || m.id) === mentorshipId);
  assert(
    studentMentorshipsRes.status === 200 && foundInStudentList?.status === 'PENDING',
    'Student can view their own mentorship requests',
    `Status is PENDING for mentor ${foundInStudentList?.mentor?.fullName}`
  );

  // Test 9: Student cannot accept/reject another user's mentorship request
  const studentAcceptRes = await patch(`/api/mentorship/${mentorshipId}/accept`, {}, studentToken);
  assert(
    studentAcceptRes.status === 403,
    'Student cannot accept mentorship request (RBAC blocked)',
    `HTTP ${studentAcceptRes.status} Forbidden`
  );

  // Test 10: Verified alumni can enable/disable mentorship
  const toggleRes = await put('/api/alumni/profile', {
    mentorshipAvailable: true,
    mentorshipAreas: ['DSA', 'System Design', 'Interview Preparation', 'Resume Guidance'],
  }, alumniToken);
  assert(
    toggleRes.status === 200 && toggleRes.data?.data?.mentorshipAvailable === true,
    'Verified alumni can manage mentorship availability and guidance areas',
    `Available: ${toggleRes.data?.data?.mentorshipAvailable}`
  );

  // Test 11: Alumni can see incoming requests
  const alumniReqsRes = await get('/api/mentorship/alumni/requests', alumniToken);
  const alumniReqList = alumniReqsRes.data?.data || [];
  const incomingReq = alumniReqList.find(m => (m._id || m.id) === mentorshipId);
  assert(
    alumniReqsRes.status === 200 && incomingReq && incomingReq.status === 'PENDING',
    'Alumni can see incoming mentorship requests with student profile',
    `Student: ${incomingReq?.student?.fullName}`
  );

  // Test 12: Alumni can accept request
  const acceptRes = await patch(`/api/mentorship/${mentorshipId}/accept`, {}, alumniToken);
  assert(
    acceptRes.status === 200 && acceptRes.data?.data?.status === 'ACCEPTED',
    'Alumni can accept mentorship request (PENDING -> ACCEPTED)',
    `New Status: ${acceptRes.data?.data?.status}`
  );

  // Test 13: Invalid transition check (ACCEPTED -> REJECTED must be 400)
  const invalidRejectRes = await patch(`/api/mentorship/${mentorshipId}/reject`, { responseMessage: 'Late reject' }, alumniToken);
  assert(
    invalidRejectRes.status === 400,
    'Invalid transition from ACCEPTED to REJECTED is blocked',
    `HTTP 400: ${invalidRejectRes.data?.message}`
  );

  // Test 14: Alumni can view active mentorships
  const activeReqsRes = await get('/api/mentorship/alumni/requests', alumniToken);
  const activeList = activeReqsRes.data?.data?.filter(m => m.status === 'ACCEPTED') || [];
  assert(
    activeList.some(m => (m._id || m.id) === mentorshipId),
    'Alumni can view active mentorship relationships',
    `Found active mentee in list`
  );

  // Test 15: Alumni can complete appropriate mentorship
  const completeRes = await patch(`/api/mentorship/${mentorshipId}/complete`, {}, alumniToken);
  assert(
    completeRes.status === 200 && completeRes.data?.data?.status === 'COMPLETED',
    'Alumni can mark active mentorship as COMPLETED (ACCEPTED -> COMPLETED)',
    `Status: ${completeRes.data?.data?.status}`
  );

  // Test 16: Alumni cannot modify another alumni's requests
  // Create request to a different mentor (alumni_microsoft)
  const req2Res = await post('/api/mentorship/request', {
    alumniId: 'alumni_microsoft',
    requestMessage: 'Guidance on Azure cloud services',
    mentorshipAreas: ['Cloud Architecture'],
  }, studentToken);
  const req2Id = req2Res.data?.data?._id || req2Res.data?.data?.id;

  // Current alumni ('demo_alumni') attempts to accept request meant for 'alumni_microsoft'
  const unauthorizedAcceptRes = await patch(`/api/mentorship/${req2Id}/accept`, {}, alumniToken);
  assert(
    unauthorizedAcceptRes.status === 403,
    'Alumni cannot accept/modify another alumni\'s mentorship requests',
    `HTTP ${unauthorizedAcceptRes.status} Forbidden`
  );

  // Test 17: Unauthenticated user cannot access protected mentorship endpoints
  const unauthRes = await get('/api/mentorship/mentors');
  assert(
    unauthRes.status === 401,
    'Unauthenticated user cannot access mentorship endpoints',
    `HTTP ${unauthRes.status} Unauthorized`
  );

  // Test 18: Student cannot access alumni-only request management endpoints
  const studentForbiddenRes = await get('/api/mentorship/alumni/requests', studentToken);
  assert(
    studentForbiddenRes.status === 403,
    'Student cannot access alumni requests management endpoint',
    `HTTP ${studentForbiddenRes.status} Forbidden`
  );

  // Test 19: Student can cancel their own pending request
  const cancelRes = await patch(`/api/mentorship/${req2Id}/cancel`, {}, studentToken);
  assert(
    cancelRes.status === 200 && cancelRes.data?.data?.status === 'CANCELLED',
    'Student can cancel their own pending mentorship request (PENDING -> CANCELLED)',
    `Status: ${cancelRes.data?.data?.status}`
  );

  // Test 20: Backend transition validation blocks terminal changes (COMPLETED -> ACCEPTED)
  const terminalBlockRes = await patch(`/api/mentorship/${mentorshipId}/accept`, {}, alumniToken);
  assert(
    terminalBlockRes.status === 400,
    'Terminal status COMPLETED cannot transition to ACCEPTED',
    `HTTP 400: ${terminalBlockRes.data?.message}`
  );

  // Test 21: Unverified alumni cannot receive new mentorship requests
  const unverifiedReqRes = await post('/api/mentorship/request', {
    alumniId: 'alumni_unverified_demo',
    requestMessage: 'Test to unverified alumni',
  }, studentToken);
  assert(
    unverifiedReqRes.status === 400 || unverifiedReqRes.status === 404,
    'Unverified alumni cannot receive mentorship requests',
    `HTTP ${unverifiedReqRes.status}: ${unverifiedReqRes.data?.message}`
  );

  // Regression Verification: Phases 1-7
  console.log('\n--- Regression Verification (Phases 1-7) ---');
  const healthCheck = await get('/api/health');
  assert(healthCheck.status === 200, 'Phase 1 Core Health API intact');

  const oppsCheck = await get('/api/opportunities', studentToken);
  assert(oppsCheck.status === 200, 'Phase 5 Opportunities API intact');

  const appsCheck = await get('/api/applications/my', studentToken);
  assert(appsCheck.status === 200, 'Phase 6 & 7 Applications & Status API intact');

  console.log(`\n=== SUMMARY: ${passed}/${total} TESTS PASSED ===\n`);
  if (passed === total) {
    console.log('ALL PHASE 8 MENTORSHIP AND REGRESSION TEST CASES PASSED WITH 100% SUCCESS!');
  }
}

runPhase8Suite().catch(console.error);
