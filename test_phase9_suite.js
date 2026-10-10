const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function login(email, password) {
  const res = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email, password }
  );
  const token = res.data?.token || res.data?.data?.token;
  if (res.status !== 200 || !token) {
    throw new Error(`Failed to log in ${email}: ${JSON.stringify(res.data)}`);
  }
  return token;
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('   CAREERBRIDGE PHASE 9 — REFERRALS TEST SUITE      ');
  console.log('====================================================\n');

  try {
    // 1. Authenticate users
    console.log('[Setup] Logging in test personas...');
    const studentToken = await login('student@demo.com', 'demo123');
    const alumniToken = await login('alumni@demo.com', 'demo123'); // Priya Sharma (VERIFIED)
    const tpoToken = await login('tpo@demo.com', 'demo123');
    const adminToken = await login('admin@demo.com', 'demo123');
    assert(studentToken && alumniToken, 'Authentication successful for Student and Verified Alumni');

    // 2. Discover open referral opportunities
    console.log('\n[TC-01] Discovering open referral opportunities with match calculation...');
    const discoveryRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/referrals/opportunities',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(discoveryRes.status === 200, 'Student can query open referrals (200 OK)');
    assert(discoveryRes.data?.data?.referrals?.length >= 3, 'Pre-seeded demo opportunities returned');
    const firstOpp = discoveryRes.data?.data?.referrals?.[0];
    assert(firstOpp && typeof firstOpp.matchScore === 'number', 'Match score calculated deterministically for student');
    assert(Array.isArray(firstOpp.matchReasons), 'Match explanation reasons included');

    // 3. Alumni creates a referral opportunity (OPEN)
    console.log('\n[TC-02] Alumni creates new referral opportunity (OPEN)...');
    const createOppRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/referrals/opportunities',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${alumniToken}`,
        },
      },
      {
        title: 'Backend Systems Engineer',
        companyName: 'Stripe',
        role: 'Software Engineer - Infrastructure',
        department: 'Core Platform',
        industry: 'FinTech',
        workMode: 'REMOTE',
        location: 'Bengaluru / Remote',
        employmentType: 'FULL_TIME',
        experienceRequired: '0-2 years',
        salaryOrPackage: '₹24 - ₹30 LPA',
        maximumRequests: 2, // low capacity for testing limit
        requiredSkills: ['Node.js', 'Go', 'Distributed Systems'],
        preferredSkills: ['Kafka', 'Docker'],
        referralInstructions: 'Include your GitHub link and a project utilizing event streams.',
        description: 'Build mission-critical payment infrastructure serving millions of global requests.',
        status: 'OPEN',
      }
    );
    assert(createOppRes.status === 201, 'Alumni successfully created referral opportunity (201 Created)');
    const createdOppId = createOppRes.data?.data?._id;
    assert(Boolean(createdOppId), `Received opportunity ID: ${createdOppId}`);

    // 4. Student views single referral opportunity details
    console.log('\n[TC-03] Student views referral opportunity details by ID...');
    const singleOppRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/referrals/opportunities/${createdOppId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const oppDetails = singleOppRes.data?.data?.opportunity || singleOppRes.data?.data;
    assert(oppDetails?.companyName === 'Stripe', 'Correct company details returned');
    assert(oppDetails?.isCapacityReached === false && !oppDetails?.existingRequest, 'Opportunity is open and student has no active request');

    // 5. Student submits referral request
    console.log('\n[TC-04] Student requests referral with resume snapshot & note...');
    const requestRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/opportunities/${createdOppId}/request`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
      },
      {
        resumeUrl: 'https://example.com/resumes/rohit-verma.pdf',
        requestMessage: 'Passionate about distributed transaction systems. Built an open-source event-driven ledger.',
      }
    );
    assert(requestRes.status === 201, 'Student request created with status PENDING (201 Created)');
    const requestId = requestRes.data?.data?._id;
    assert(Boolean(requestId), `Referral Request ID: ${requestId}`);

    // 6. Duplicate request prevention
    console.log('\n[TC-05] Duplicate referral request prevention...');
    const dupRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/opportunities/${createdOppId}/request`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
      },
      {
        resumeUrl: 'https://example.com/resumes/rohit-verma.pdf',
        requestMessage: 'Trying again...',
      }
    );
    assert(dupRes.status === 400, 'Duplicate active request blocked with 400 Bad Request');

    // 7. Student checks their own referral requests list
    console.log('\n[TC-06] Student views their submitted referral requests...');
    const myRequestsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/referrals/my-requests',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(myRequestsRes.status === 200, 'Student retrieved their requests (200 OK)');
    const hasMyReq = myRequestsRes.data?.data?.some((r) => r._id === requestId);
    assert(hasMyReq, 'Recently submitted request is listed in student dashboard');

    // 8. Alumni views incoming requests for their opportunity
    console.log('\n[TC-07] Alumni views candidate requests for their opportunity...');
    const oppRequestsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/referrals/alumni/opportunities/${createdOppId}/requests`,
      method: 'GET',
      headers: { Authorization: `Bearer ${alumniToken}` },
    });
    assert(oppRequestsRes.status === 200, 'Alumni retrieved candidates (200 OK)');
    assert(oppRequestsRes.data?.data?.length >= 1, 'Candidate request found in alumni list');

    // 9. Alumni accepts candidate request (PENDING -> ACCEPTED)
    console.log('\n[TC-08] Alumni accepts candidate request (PENDING -> ACCEPTED)...');
    const acceptRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/requests/${requestId}/accept`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${alumniToken}`,
        },
      },
      { alumniResponse: 'Impressive projects. I will submit your profile to our engineering lead.' }
    );
    assert(acceptRes.status === 200, 'Alumni accepted request (200 OK)');
    assert(acceptRes.data?.data?.status === 'ACCEPTED', 'Request status updated to ACCEPTED');

    // 10. Invalid transition check: Cannot transition ACCEPTED -> PENDING
    console.log('\n[TC-09] Invalid status transition validation...');
    const invalidTransRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/requests/${requestId}/reject`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${alumniToken}`,
        },
      },
      {}
    );
    // Since ACCEPTED -> REJECTED is allowed (alumni can still decline before submitting),
    // let's test completing from ACCEPTED directly before REFERRED
    const invalidCompleteRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/requests/${requestId}/complete`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${alumniToken}` },
      },
      {}
    );
    assert(invalidCompleteRes.status === 400, 'Invalid transition (ACCEPTED -> COMPLETED without REFERRED) rejected (400)');

    // 11. Alumni marks candidate as referred (ACCEPTED -> REFERRED)
    console.log('\n[TC-10] Alumni marks candidate as referred (ACCEPTED -> REFERRED)...');
    const referredRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/requests/${requestId}/referred`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${alumniToken}`,
        },
      },
      { alumniResponse: 'Referred on internal portal (Requisition #STRIPE-4029). Check your inbox.' }
    );
    assert(referredRes.status === 200, 'Candidate marked as REFERRED (200 OK)');
    assert(referredRes.data?.data?.status === 'REFERRED', 'Status successfully changed to REFERRED');
    assert(Boolean(referredRes.data?.data?.referredAt), 'referredAt timestamp captured');

    // 12. Student / Alumni updates external outcome
    console.log('\n[TC-11] Updating company hiring outcome...');
    const outcomeRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/requests/${requestId}/outcome`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
      },
      {
        outcome: 'INTERVIEW',
        outcomeNote: 'Cleared screening call with recruiter, technical round set for next Monday.',
      }
    );
    assert(outcomeRes.status === 200, 'Outcome updated to INTERVIEW (200 OK)');
    assert(outcomeRes.data?.data?.outcome === 'INTERVIEW', 'Outcome correctly persisted');

    // 13. Complete referral process
    console.log('\n[TC-12] Marking referral as COMPLETED...');
    const completeRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/requests/${requestId}/complete`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${alumniToken}` },
      },
      {}
    );
    assert(completeRes.status === 200, 'Referral successfully COMPLETED (200 OK)');
    assert(completeRes.data?.data?.status === 'COMPLETED', 'Status is COMPLETED');

    // 14. RBAC: Student cannot create a referral opportunity
    console.log('\n[TC-13] RBAC check: Student cannot create referral opportunity...');
    const studentCreateRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/referrals/opportunities',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${studentToken}`,
        },
      },
      { title: 'Fake Role', companyName: 'Fake Corp' }
    );
    assert(studentCreateRes.status === 403, 'Student blocked from creating opportunity (403 Forbidden)');

    // 15. RBAC: Alumni cannot request a referral
    console.log('\n[TC-14] RBAC check: Alumni cannot request a referral...');
    const alumniRequestRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/opportunities/${createdOppId}/request`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${alumniToken}`,
        },
      },
      { requestMessage: 'Alumni requesting referral' }
    );
    assert(alumniRequestRes.status === 403, 'Alumni blocked from requesting referral (403 Forbidden)');

    // 16. Opportunity Status Management: Close opportunity
    console.log('\n[TC-15] Alumni closes referral opportunity...');
    const closeRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/referrals/opportunities/${createdOppId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${alumniToken}`,
        },
      },
      { status: 'CLOSED' }
    );
    assert(closeRes.status === 200, 'Opportunity successfully CLOSED (200 OK)');
    assert(closeRes.data?.data?.status === 'CLOSED', 'Status updated to CLOSED');

    // 17. Regression Checks for Previous Phases
    console.log('\n[Regression] Checking Phases 1-8 modules...');
    // Phase 5 Opportunities
    const oppsCheck = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/opportunities',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(oppsCheck.status === 200, 'Phase 5: Opportunities endpoint active and 200 OK');

    // Phase 6 & 7 Applications
    const appsCheck = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/applications/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(appsCheck.status === 200, 'Phases 6 & 7: Student Applications endpoint active and 200 OK');

    // Phase 8 Mentorship
    const mentorsCheck = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/mentorship/mentors',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(mentorsCheck.status === 200, 'Phase 8: Mentorship Mentors Discovery active and 200 OK');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test Suite encountered unhandled error:', err);
    process.exit(1);
  }
}

runTests();
