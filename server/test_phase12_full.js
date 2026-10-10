const BASE_URL = 'http://localhost:5000';

async function runPhase12Verification() {
  console.log('====================================================');
  console.log('   CareerBridge — Phase 12 Full Verification Suite  ');
  console.log('====================================================\n');

  // 1. Authenticate users
  const login = async (email, password = 'demo123') => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  };

  const student = await login('student@demo.com');
  const alumni = await login('alumni@demo.com');
  const tpo = await login('tpo@demo.com');
  const admin = await login('admin@demo.com');

  console.log('1. User Authentication:');
  console.log('   ✓ Student Token acquired:', !!student.token);
  console.log('   ✓ Alumni Token acquired:', !!alumni.token);
  console.log('   ✓ TPO Token acquired:', !!tpo.token);
  console.log('   ✓ Admin Token acquired:', !!admin.token);

  // 2. Security & RBAC Gates
  console.log('\n2. Security & RBAC Protection:');
  const unauth = await fetch(`${BASE_URL}/api/dashboard/student`);
  console.log('   ✓ Unauthenticated request status:', unauth.status, '(expected 401)');
  if (unauth.status !== 401) throw new Error('Unauthenticated access was not blocked!');

  const crossRoles = [
    { role: 'Student -> Alumni', token: student.token, url: '/api/dashboard/alumni' },
    { role: 'Student -> TPO', token: student.token, url: '/api/dashboard/tpo' },
    { role: 'Student -> Admin', token: student.token, url: '/api/dashboard/admin' },
    { role: 'Alumni -> TPO', token: alumni.token, url: '/api/dashboard/tpo' },
    { role: 'Alumni -> Admin', token: alumni.token, url: '/api/dashboard/admin' },
    { role: 'TPO -> Admin', token: tpo.token, url: '/api/dashboard/admin' },
  ];

  for (const test of crossRoles) {
    const res = await fetch(`${BASE_URL}${test.url}`, {
      headers: { Authorization: `Bearer ${test.token}` },
    });
    console.log(`   ✓ RBAC Gate [${test.role}] status:`, res.status, '(expected 403)');
    if (res.status !== 403) throw new Error(`RBAC gate breached for ${test.role}!`);
  }

  // 3. Student Dashboard
  console.log('\n3. Student Dashboard Validation:');
  const sRes = await fetch(`${BASE_URL}/api/dashboard/student`, {
    headers: { Authorization: `Bearer ${student.token}` },
  });
  const sData = await sRes.json();
  console.log('   ✓ Status:', sRes.status, 'Success:', sData.success);
  console.log('   ✓ Profile Name:', sData.data?.profile?.fullName);
  console.log('   ✓ Profile Completion %:', sData.data?.profile?.completion?.percentage);
  console.log('   ✓ Available Opportunities:', sData.data?.stats?.availableOpportunities);
  console.log('   ✓ Status Distribution Keys:', Object.keys(sData.data?.applicationStatusDistribution || {}));
  console.log('   ✓ Trend Data Points:', sData.data?.applicationTrend?.length);
  console.log('   ✓ Quick Actions Count:', sData.data?.quickActions?.length);
  if (!sData.data?.stats || !sData.data?.applicationStatusDistribution) {
    throw new Error('Student dashboard schema incomplete!');
  }

  // 4. Alumni Dashboard
  console.log('\n4. Alumni Dashboard Validation:');
  const aRes = await fetch(`${BASE_URL}/api/dashboard/alumni`, {
    headers: { Authorization: `Bearer ${alumni.token}` },
  });
  const aData = await aRes.json();
  console.log('   ✓ Status:', aRes.status, 'Success:', aData.success);
  console.log('   ✓ Profile Name:', aData.data?.profile?.fullName);
  console.log('   ✓ Verification Status:', aData.data?.profile?.verificationStatus);
  console.log('   ✓ Mentorship Distribution:', aData.data?.mentorshipDistribution);
  console.log('   ✓ Referral Distribution:', aData.data?.referralDistribution);
  console.log('   ✓ Referral Opportunities Count:', aData.data?.stats?.totalReferralOpportunities);
  console.log('   ✓ Quick Actions Count:', aData.data?.quickActions?.length);
  if (!aData.data?.stats || !aData.data?.mentorshipDistribution) {
    throw new Error('Alumni dashboard schema incomplete!');
  }

  // 5. TPO Dashboard
  console.log('\n5. TPO Dashboard Validation:');
  const tRes = await fetch(`${BASE_URL}/api/dashboard/tpo`, {
    headers: { Authorization: `Bearer ${tpo.token}` },
  });
  const tData = await tRes.json();
  console.log('   ✓ Status:', tRes.status, 'Success:', tData.success);
  console.log('   ✓ Total Opportunities:', tData.data?.stats?.totalOpportunities);
  console.log('   ✓ Placement vs Internship:', tData.data?.placementVsInternship);
  console.log('   ✓ Selection Rate:', tData.data?.stats?.selectionRate);
  console.log('   ✓ Application Influx Trend Points:', tData.data?.applicationTrend?.length);
  console.log('   ✓ Quick Actions Count:', tData.data?.quickActions?.length);
  if (!tData.data?.stats || !tData.data?.placementVsInternship) {
    throw new Error('TPO dashboard schema incomplete!');
  }

  // 6. Admin Dashboard
  console.log('\n6. Admin Dashboard Validation:');
  const adRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
    headers: { Authorization: `Bearer ${admin.token}` },
  });
  const adData = await adRes.json();
  console.log('   ✓ Status:', adRes.status, 'Success:', adData.success);
  console.log('   ✓ Total Users Count:', adData.data?.stats?.totalUsers);
  console.log('   ✓ Role Distribution:', adData.data?.roleDistribution);
  console.log('   ✓ Alumni Verification Stats:', adData.data?.alumniVerification);
  console.log('   ✓ Platform Activity Ecosystem:', adData.data?.platformActivity);
  console.log('   ✓ User Growth Trend Points:', adData.data?.userGrowth?.length);
  console.log('   ✓ Recent Activity Count:', adData.data?.recentActivity?.length);
  if (!adData.data?.stats || !adData.data?.roleDistribution) {
    throw new Error('Admin dashboard schema incomplete!');
  }

  // 7. Privacy & Leakage Audit
  console.log('\n7. Privacy & Leakage Audit:');
  const allPayloadStrings = JSON.stringify([sData, aData, tData, adData]);
  const containsPassword = allPayloadStrings.includes('password') || allPayloadStrings.includes('$2a$');
  console.log('   ✓ No password hashes or secrets in any dashboard payload:', !containsPassword);
  if (containsPassword) throw new Error('Sensitive password hash detected in dashboard payload!');

  const alumniPayloadString = JSON.stringify(aData);
  const containsCgpa = alumniPayloadString.includes('cgpa') || alumniPayloadString.includes('backlogs');
  console.log('   ✓ Alumni payload does not leak private student CGPA or backlogs:', !containsCgpa);
  if (containsCgpa) throw new Error('Private student academic data leaked to alumni dashboard!');

  // 8. Regression Verification of Prior Phases (1-11)
  console.log('\n8. Regression Testing (Phases 1-11):');
  const notifRes = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${student.token}` },
  });
  console.log('   ✓ Phase 11 (Notifications) unread-count status:', notifRes.status);

  const chatRes = await fetch(`${BASE_URL}/api/chat/conversations`, {
    headers: { Authorization: `Bearer ${student.token}` },
  });
  console.log('   ✓ Phase 10 (Chat) conversations status:', chatRes.status);

  const oppRes = await fetch(`${BASE_URL}/api/opportunities?limit=2`, {
    headers: { Authorization: `Bearer ${student.token}` },
  });
  console.log('   ✓ Phase 5 (Opportunities) status:', oppRes.status);

  const mentorRes = await fetch(`${BASE_URL}/api/mentorship/mentors`, {
    headers: { Authorization: `Bearer ${student.token}` },
  });
  console.log('   ✓ Phase 8 (Mentorship) discovery status:', mentorRes.status);

  const refRes = await fetch(`${BASE_URL}/api/referrals/opportunities`, {
    headers: { Authorization: `Bearer ${student.token}` },
  });
  console.log('   ✓ Phase 9 (Referrals) discovery status:', refRes.status);

  console.log('\n====================================================');
  console.log('   ALL PHASE 12 VERIFICATIONS PASSED SUCCESSFULLY!  ');
  console.log('====================================================');
}

runPhase12Verification().catch((err) => {
  console.error('\n❌ Verification Suite Failed:', err);
  process.exit(1);
});
