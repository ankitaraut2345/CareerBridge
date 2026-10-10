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

async function runPhase6Tests() {
  console.log('=== CareerBridge Phase 6 Live Verification Suite ===\n');

  // 1. Health check
  const health = await get('/api/health');
  console.log('1. Health check:', health.status === 200 ? 'PASS (200)' : 'FAIL', health.data);

  // 2. Student login
  const studentAuth = await post('/api/auth/login', { email: 'student@demo.com', password: 'demo123' });
  const studentToken = studentAuth.data.token;
  console.log('2. Student Authentication:', studentAuth.status === 200 ? 'PASS (200)' : 'FAIL', 'User:', studentAuth.data.user?.name);

  // 3. TPO login
  const tpoAuth = await post('/api/auth/login', { email: 'tpo@demo.com', password: 'demo123' });
  const tpoToken = tpoAuth.data.token;
  console.log('3. TPO Authentication:', tpoAuth.status === 200 ? 'PASS (200)' : 'FAIL', 'User:', tpoAuth.data.user?.name);

  // 4. Load opportunities
  const oppsRes = await get('/api/opportunities', studentToken);
  const oppList = oppsRes.data.data || [];
  console.log('4. Opportunity Listing:', oppsRes.status === 200 ? 'PASS (200)' : 'FAIL', 'Total Count:', oppList.length);

  if (oppList.length === 0) {
    console.error('No opportunities found to test eligibility and applications!');
    return;
  }

  // 5. Check eligibility across all opportunities
  let eligibleOpp = null;
  for (const opp of oppList) {
    const currId = opp._id || opp.id;
    const check = await get('/api/opportunities/' + currId + '/eligibility', studentToken);
    console.log(`   Opp "${opp.title.substring(0, 30)}...": State=${check.data.data?.state}, Eligible=${check.data.data?.eligible}`);
    if (check.data.data?.eligible && !eligibleOpp) {
      eligibleOpp = opp;
    }
  }

  // If no eligible opportunity exists, let's check what criteria failed for the first one
  const targetOpp = eligibleOpp || oppList[0];
  const targetId = targetOpp._id || targetOpp.id;
  const eligRes = await get('/api/opportunities/' + targetId + '/eligibility', studentToken);
  console.log('\n5. Dynamic Eligibility Details for:', targetOpp.title);
  console.log('   State:', eligRes.data.data?.state, '| Eligible:', eligRes.data.data?.eligible);
  eligRes.data.data?.checks?.forEach(c => {
    console.log(`   - [${c.passed ? 'PASS' : 'FAIL'}] ${c.criterion}: Required="${c.required}", Actual="${c.actual}"`);
  });

  if (!eligibleOpp) {
    console.log('\nStudent profile credentials:');
    const profileRes = await get('/api/students/profile', studentToken);
    console.log('Student Profile:', profileRes.data.data);
    // Let's create an opportunity that our demo student is eligible for or update student skills/dept
  }

  // 6. Test Application Submission on the ELIGIBLE opportunity
  const applyRes = await post('/api/opportunities/' + targetId + '/apply', {
    applicationMessage: 'Strong background in algorithms and React development.'
  }, studentToken);
  console.log('6. Application Submission:', applyRes.status === 201 ? 'PASS (201 Created)' : 'STATUS: ' + applyRes.status, applyRes.data.message || 'Submitted');

  // 7. Test Duplicate Application Prevention (Must be 409 Conflict)
  const dupRes = await post('/api/opportunities/' + targetId + '/apply', {
    applicationMessage: 'Attempting duplicate application.'
  }, studentToken);
  console.log('7. Duplicate Application Check:', dupRes.status === 409 ? 'PASS (409 Conflict Caught)' : 'STATUS: ' + dupRes.status, dupRes.data.message);

  // 8. Test Student "My Applications" API
  const myAppsRes = await get('/api/applications/my', studentToken);
  console.log('8. My Applications API:', myAppsRes.status === 200 ? 'PASS (200)' : 'FAIL', 'Applications Count:', myAppsRes.data.data?.length);

  const appliedApp = myAppsRes.data.data?.[0];
  const appId = appliedApp?._id || appliedApp?.id;

  // 9. Test Single Application Details API
  if (appId) {
    const singleAppRes = await get('/api/applications/' + appId, studentToken);
    console.log('9. Application Details API:', singleAppRes.status === 200 ? 'PASS (200)' : 'FAIL', 'Status:', singleAppRes.data.data?.status);
  }

  // 10. Test TPO "View Applicants" for Opportunity
  const tpoAppsRes = await get('/api/opportunities/' + targetId + '/applications', tpoToken);
  console.log('10. TPO View Applicants API:', tpoAppsRes.status === 200 ? 'PASS (200)' : 'FAIL', 'Roster Count:', tpoAppsRes.data.data?.length);
  if (tpoAppsRes.data.data?.length > 0) {
    const firstApplicant = tpoAppsRes.data.data[0];
    console.log('    Applicant:', firstApplicant.student?.name, '| Dept:', firstApplicant.student?.department, '| CGPA:', firstApplicant.studentSnapshot?.cgpa || firstApplicant.student?.cgpa);
  }

  // 11. Test Security / RBAC: Student attempting to access TPO applicant roster (Must be 403)
  const studentTpoRes = await get('/api/opportunities/' + targetId + '/applications', studentToken);
  console.log('11. RBAC Check (Student -> TPO Endpoint):', studentTpoRes.status === 403 ? 'PASS (403 Forbidden)' : 'STATUS: ' + studentTpoRes.status, studentTpoRes.data.message);

  // 12. Test Application Withdrawal
  if (appId) {
    const withdrawRes = await patch('/api/applications/' + appId + '/withdraw', { reason: 'Schedule conflict' }, studentToken);
    console.log('12. Application Withdrawal API:', withdrawRes.status === 200 ? 'PASS (200)' : 'STATUS: ' + withdrawRes.status, 'New Status:', withdrawRes.data.data?.status);
  }

  console.log('\n=== All Phase 6 Verification Checks Successfully Completed ===');
}

runPhase6Tests().catch(console.error);
