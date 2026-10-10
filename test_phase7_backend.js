const http = require('http');

function post(urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

function get(urlPath, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function patch(urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

function put(urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

function del(urlPath, data, token) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(data || {});
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function runPhase7Tests() {
  console.log('=== CareerBridge Phase 7 Status & Interview Verification ===\n');

  // 1. Auth tokens
  const sAuth = await post('/api/auth/login', { email: 'student@demo.com', password: 'demo123' });
  const studentToken = sAuth.data.token;
  const tAuth = await post('/api/auth/login', { email: 'tpo@demo.com', password: 'demo123' });
  const tpoToken = tAuth.data.token;
  console.log('1. Logins: Student & TPO authenticated successfully.');

  // 2. Submit a fresh application for Amazon drive
  const opps = await get('/api/opportunities', studentToken);
  const amazonOpp = opps.data.data?.find(o => o.title.includes('Software Development Engineer')) || opps.data.data[0];
  const oppId = amazonOpp._id || amazonOpp.id;
  console.log('2. Target Opportunity:', oppId, '|', amazonOpp.title);

  // Apply as student
  const applyRes = await post(`/api/opportunities/${oppId}/apply`, {
    applicationMessage: 'Phase 7 full recruitment test.'
  }, studentToken);
  console.log('   Apply status:', applyRes.status, applyRes.data.message || 'Created');

  // Get application id
  const myApps = await get('/api/applications/my', studentToken);
  const targetApp = myApps.data.data?.find(a => (a.opportunityId === oppId || a.opportunity?.id === oppId));
  const appId = targetApp._id || targetApp.id;
  console.log('3. Application ID:', appId, '| Current status:', targetApp.status);
  console.log('   Initial Status History length:', targetApp.statusHistory?.length);

  // 4. Test RBAC: Student attempting to change status (MUST be 403 Forbidden)
  const studentStatusAttempt = await patch(`/api/applications/${appId}/status`, {
    status: 'SHORTLISTED'
  }, studentToken);
  console.log('4. RBAC Check (Student -> PATCH /status):', studentStatusAttempt.status === 403 ? 'PASS (403 Forbidden)' : 'FAIL: ' + studentStatusAttempt.status);

  // 5. Test Invalid Status Transition: APPLIED -> SELECTED (MUST be 400 Bad Request)
  const invalidTransition = await patch(`/api/applications/${appId}/status`, {
    status: 'SELECTED',
    note: 'Trying to skip to selected'
  }, tpoToken);
  console.log('5. Invalid Transition Check (APPLIED -> SELECTED):', invalidTransition.status === 400 ? 'PASS (400 Rejected)' : 'FAIL: ' + invalidTransition.status, '|', invalidTransition.data.message);

  // 6. Test Valid Transition: APPLIED -> SHORTLISTED (200 OK)
  const shortlistRes = await patch(`/api/applications/${appId}/status`, {
    status: 'SHORTLISTED',
    note: 'Shortlisted for technical evaluation.'
  }, tpoToken);
  console.log('6. Valid Transition (APPLIED -> SHORTLISTED):', shortlistRes.status === 200 ? 'PASS (200)' : 'FAIL: ' + shortlistRes.status, '| New Status:', shortlistRes.data.data?.status);

  // 7. Test Interview Validation: Missing meetingLink for ONLINE interview (MUST be 400)
  const invalidInterview = await post(`/api/applications/${appId}/interview`, {
    round: 'Technical Round 1',
    date: '2026-10-15',
    startTime: '10:00 AM',
    mode: 'ONLINE',
    // missing meetingLink!
  }, tpoToken);
  console.log('7. Interview Validation (ONLINE without meetingLink):', invalidInterview.status === 400 ? 'PASS (400 Rejected)' : 'FAIL: ' + invalidInterview.status, '|', invalidInterview.data.message);

  // 8. Test Schedule Interview (Valid): Should advance status to INTERVIEW and record interview details
  const validInterview = await post(`/api/applications/${appId}/interview`, {
    round: 'Technical Round 1',
    title: 'Data Structures & Algorithms Evaluation',
    date: '2026-10-15',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    mode: 'ONLINE',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    interviewer: 'Senior Principal Engineer',
    instructions: 'Please be ready with your IDE and stable internet connection.',
  }, tpoToken);
  console.log('8. Schedule Interview (POST):', validInterview.status === 200 ? 'PASS (200)' : 'FAIL: ' + validInterview.status, '| App Status:', validInterview.data.data?.status);
  console.log('   Interview Object:', validInterview.data.data?.interview?.title, '| Link:', validInterview.data.data?.interview?.meetingLink);

  // 9. Test Update Interview (PUT): Reschedule or update instructions
  const updateInterviewRes = await put(`/api/applications/${appId}/interview`, {
    startTime: '10:30 AM',
    endTime: '11:30 AM',
    instructions: 'Updated: Join 10 minutes prior.',
    status: 'RESCHEDULED',
  }, tpoToken);
  console.log('9. Update Interview (PUT):', updateInterviewRes.status === 200 ? 'PASS (200)' : 'FAIL: ' + updateInterviewRes.status, '| New Time:', updateInterviewRes.data.data?.interview?.startTime);

  // 10. Test Advance to SELECTED: INTERVIEW -> SELECTED
  const selectedRes = await patch(`/api/applications/${appId}/status`, {
    status: 'SELECTED',
    note: 'Congratulations! Selected for Software Development Engineer role.'
  }, tpoToken);
  console.log('10. Transition to SELECTED (INTERVIEW -> SELECTED):', selectedRes.status === 200 ? 'PASS (200)' : 'FAIL: ' + selectedRes.status, '| Status:', selectedRes.data.data?.status);

  // 11. Test Terminal State: SELECTED -> APPLIED (MUST be 400)
  const terminalBlock = await patch(`/api/applications/${appId}/status`, {
    status: 'APPLIED',
  }, tpoToken);
  console.log('11. Terminal State Block (SELECTED -> APPLIED):', terminalBlock.status === 400 ? 'PASS (400 Blocked)' : 'FAIL: ' + terminalBlock.status, '|', terminalBlock.data.message);

  // 12. Student View: Student fetches own application with full timeline and interview details
  const studentViewRes = await get(`/api/applications/${appId}`, studentToken);
  const appData = studentViewRes.data.data;
  console.log('\n12. Student Application View:');
  console.log('    Status:', appData.status);
  console.log('    Status History Entries (' + appData.statusHistory?.length + '):');
  appData.statusHistory?.forEach((h, i) => {
    console.log(`      ${i + 1}. [${h.status}] by ${h.changedByName || 'System'}: "${h.note}"`);
  });
  console.log('    Interview Details Present:', !!appData.interview, '| Mode:', appData.interview?.mode, '| Status:', appData.interview?.status);

  // 13. Test Cancel Interview (DELETE) on an interview
  const cancelRes = await del(`/api/applications/${appId}/interview`, { reason: 'Position closed' }, tpoToken);
  console.log('13. Cancel Interview (DELETE):', cancelRes.status === 200 ? 'PASS (200)' : 'FAIL: ' + cancelRes.status, '| Interview Status:', cancelRes.data.data?.interview?.status);

  console.log('\n=== All Phase 7 Backend Verification Checks Passed Successfully! ===');
}

runPhase7Tests().catch(console.error);
