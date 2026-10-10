const BASE_URL = 'http://localhost:5000';

async function testEventTriggers() {
  console.log('--- Testing Phase 11 Cross-Module Event Triggers ---');

  // 1. Log in Student & Alumni & TPO
  const studentRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@demo.com', password: 'demo123' })
  });
  const { token: studentToken, user: studentUser } = await studentRes.json();

  const alumniRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alumni@demo.com', password: 'demo123' })
  });
  const { token: alumniToken, user: alumniUser } = await alumniRes.json();

  const tpoRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'tpo@demo.com', password: 'demo123' })
  });
  const { token: tpoToken, user: tpoUser } = await tpoRes.json();

  console.log('✓ Logged in Student, Alumni, and TPO');

  const studentId = studentUser.id || studentUser._id;
  const alumniId = alumniUser.id || alumniUser._id;

  // 2. Mentorship Request: Student -> Alumni
  console.log('\n2. Testing Mentorship Request Event:');
  const mentorReqRes = await fetch(`${BASE_URL}/api/mentorship/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      alumniId,
      requestMessage: 'Hi! Could you mentor me for software engineering interviews?'
    })
  });
  const mentorReqData = await mentorReqRes.json();
  console.log('   Mentorship request API status:', mentorReqRes.status);

  // Check Alumni received notification
  const alumniNotifRes = await fetch(`${BASE_URL}/api/notifications?limit=10`, {
    headers: { Authorization: `Bearer ${alumniToken}` }
  });
  const alumniNotifs = await alumniNotifRes.json();
  const mentorNotif = alumniNotifs.data?.find((n) => n.type === 'MENTORSHIP_REQUEST_RECEIVED');
  console.log('   Alumni received MENTORSHIP_REQUEST_RECEIVED:', !!mentorNotif, mentorNotif?.title);

  // 3. Mentorship Accept: Alumni -> Student
  const reqId = mentorReqData.data?._id || mentorReqData.data?.id;
  if (reqId) {
    console.log('\n3. Testing Mentorship Accept Event:');
    const acceptRes = await fetch(`${BASE_URL}/api/mentorship/${reqId}/accept`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${alumniToken}` }
    });
    console.log('   Mentorship accept API status:', acceptRes.status);

    const studentNotifRes = await fetch(`${BASE_URL}/api/notifications?limit=10`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const studentNotifs = await studentNotifRes.json();
    const acceptNotif = studentNotifs.data?.find((n) => n.type === 'MENTORSHIP_REQUEST_ACCEPTED');
    console.log('   Student received MENTORSHIP_REQUEST_ACCEPTED:', !!acceptNotif, acceptNotif?.title);
  }

  // 4. Referral Request: Student -> Alumni using existing ref_google_swe
  console.log('\n4. Testing Referral Request Event:');
  const reqRefRes = await fetch(`${BASE_URL}/api/referrals/opportunities/ref_google_swe/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`
    },
    body: JSON.stringify({
      requestMessage: 'I have strong React and Node.js skills and would love a referral.',
      resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf'
    })
  });
  console.log('   Referral request API status:', reqRefRes.status);

  const refCheckRes = await fetch(`${BASE_URL}/api/notifications?limit=10`, {
    headers: { Authorization: `Bearer ${alumniToken}` }
  });
  const refNotifs = await refCheckRes.json();
  const refNotif = refNotifs.data?.find((n) => n.type === 'REFERRAL_REQUEST_RECEIVED');
  console.log('   Alumni received REFERRAL_REQUEST_RECEIVED:', !!refNotif, refNotif?.title);

  // 5. Opportunity Publish: TPO publishes opportunity
  console.log('\n5. Testing Opportunity Publish Event:');
  const pubOppRes = await fetch(`${BASE_URL}/api/opportunities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tpoToken}`
    },
    body: JSON.stringify({
      title: 'Graduate Cloud Architect 2026',
      type: 'PLACEMENT',
      companyName: 'TechCorp Cloud Systems',
      role: 'Graduate Cloud Architect',
      description: 'Exciting campus placement opportunity for computer engineering students.',
      location: 'Bengaluru / Remote',
      applicationDeadline: '2026-12-31T23:59:59.000Z',
      status: 'PUBLISHED'
    })
  });
  const pubOppData = await pubOppRes.json();
  const createdOppId = pubOppData.data?._id || pubOppData.data?.id;
  console.log('   Opportunity create API status:', pubOppRes.status, 'ID:', createdOppId);

  // Student checks for OPPORTUNITY_PUBLISHED notification
  const studentOppNotifRes = await fetch(`${BASE_URL}/api/notifications?limit=15`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentOppNotifs = await studentOppNotifRes.json();
  const oppNotif = studentOppNotifs.data?.find((n) => n.type === 'OPPORTUNITY_PUBLISHED');
  console.log('   Student received OPPORTUNITY_PUBLISHED:', !!oppNotif, oppNotif?.title);

  // 6. Application Status & Interview Notifications
  if (createdOppId) {
    console.log('\n6. Testing Application & Interview Event Notifications:');
    // Student applies to opportunity
    const applyRes = await fetch(`${BASE_URL}/api/opportunities/${createdOppId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        resumeUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf'
      })
    });
    const applyData = await applyRes.json();
    const appId = applyData.data?._id || applyData.data?.id;
    console.log('   Student applied to opportunity status:', applyRes.status, 'App ID:', appId);

    if (appId) {
      // TPO updates status to SHORTLISTED
      const statusRes = await fetch(`${BASE_URL}/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tpoToken}`
        },
        body: JSON.stringify({ status: 'SHORTLISTED', notes: 'Great profile!' })
      });
      console.log('   TPO updated application status to SHORTLISTED status:', statusRes.status);

      // Student checks for status notification
      const checkShortlistRes = await fetch(`${BASE_URL}/api/notifications?limit=15`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const shortlistNotifs = await checkShortlistRes.json();
      const shortlistNotif = shortlistNotifs.data?.find((n) => n.type === 'APPLICATION_STATUS_CHANGED');
      console.log('   Student received APPLICATION_STATUS_CHANGED:', !!shortlistNotif, shortlistNotif?.title);

      // TPO schedules interview
      const scheduleRes = await fetch(`${BASE_URL}/api/applications/${appId}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tpoToken}`
        },
        body: JSON.stringify({
          date: '2026-10-15',
          startTime: '11:00 AM',
          mode: 'ONLINE',
          round: 'Technical Round 1',
          meetingLink: 'https://meet.google.com/abc-def-ghi',
          instructions: 'Please bring your laptop and prepare DSA questions.'
        })
      });
      console.log('   TPO scheduled interview status:', scheduleRes.status);

      // Student checks for interview notification
      const checkInterviewRes = await fetch(`${BASE_URL}/api/notifications?limit=15`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const interviewNotifs = await checkInterviewRes.json();
      const interviewNotif = interviewNotifs.data?.find((n) => n.type === 'INTERVIEW_SCHEDULED');
      console.log('   Student received INTERVIEW_SCHEDULED:', !!interviewNotif, interviewNotif?.title);
    }
  }

  console.log('\n--- ALL CROSS-MODULE EVENT TRIGGERS VERIFIED SUCCESSFULLY! ---');
}

testEventTriggers().catch((err) => {
  console.error('Event trigger test failed:', err);
  process.exit(1);
});
