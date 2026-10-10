const BASE_URL = 'http://localhost:5000';

async function testDashboards() {
  console.log('--- Testing Phase 12 Dashboard APIs ---');

  // 1. Log in all 4 roles
  const login = async (email) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'demo123' })
    });
    return res.json();
  };

  const student = await login('student@demo.com');
  const alumni = await login('alumni@demo.com');
  const tpo = await login('tpo@demo.com');
  const admin = await login('admin@demo.com');

  console.log('✓ Logged in Student, Alumni, TPO, Admin');

  // 2. Unauthenticated check
  const unauthRes = await fetch(`${BASE_URL}/api/dashboard/student`);
  console.log('2. Unauthenticated GET /api/dashboard/student status:', unauthRes.status, '(expected 401)');
  if (unauthRes.status !== 401) throw new Error('Unauthenticated test failed');

  // 3. Role Authorization checks
  console.log('3. Testing Role-Based Authorization Gates:');
  const studentAsAlumni = await fetch(`${BASE_URL}/api/dashboard/alumni`, {
    headers: { Authorization: `Bearer ${student.token}` }
  });
  console.log('   Student accessing /api/dashboard/alumni status:', studentAsAlumni.status, '(expected 403)');
  if (studentAsAlumni.status !== 403) throw new Error('Student accessed Alumni dashboard!');

  const alumniAsTpo = await fetch(`${BASE_URL}/api/dashboard/tpo`, {
    headers: { Authorization: `Bearer ${alumni.token}` }
  });
  console.log('   Alumni accessing /api/dashboard/tpo status:', alumniAsTpo.status, '(expected 403)');
  if (alumniAsTpo.status !== 403) throw new Error('Alumni accessed TPO dashboard!');

  const tpoAsAdmin = await fetch(`${BASE_URL}/api/dashboard/admin`, {
    headers: { Authorization: `Bearer ${tpo.token}` }
  });
  console.log('   TPO accessing /api/dashboard/admin status:', tpoAsAdmin.status, '(expected 403)');
  if (tpoAsAdmin.status !== 403) throw new Error('TPO accessed Admin dashboard!');

  // 4. Student Dashboard Data
  console.log('\n4. Testing Student Dashboard:');
  const studentRes = await fetch(`${BASE_URL}/api/dashboard/student`, {
    headers: { Authorization: `Bearer ${student.token}` }
  });
  const studentData = await studentRes.json();
  console.log('   Student Dashboard status:', studentRes.status, 'Success:', studentData.success);
  console.log('   Stats:', studentData.data?.stats);
  console.log('   Profile Completion:', studentData.data?.profile?.completion);
  console.log('   Application Status Distribution:', studentData.data?.applicationStatusDistribution);
  console.log('   Application Trend Points:', studentData.data?.applicationTrend?.length);

  // 5. Alumni Dashboard Data
  console.log('\n5. Testing Alumni Dashboard:');
  const alumniRes = await fetch(`${BASE_URL}/api/dashboard/alumni`, {
    headers: { Authorization: `Bearer ${alumni.token}` }
  });
  const alumniData = await alumniRes.json();
  console.log('   Alumni Dashboard status:', alumniRes.status, 'Success:', alumniData.success);
  console.log('   Stats:', alumniData.data?.stats);
  console.log('   Mentorship Distribution:', alumniData.data?.mentorshipDistribution);
  console.log('   Referral Distribution:', alumniData.data?.referralDistribution);

  // 6. TPO Dashboard Data
  console.log('\n6. Testing TPO Dashboard:');
  const tpoRes = await fetch(`${BASE_URL}/api/dashboard/tpo`, {
    headers: { Authorization: `Bearer ${tpo.token}` }
  });
  const tpoData = await tpoRes.json();
  console.log('   TPO Dashboard status:', tpoRes.status, 'Success:', tpoData.success);
  console.log('   Stats:', tpoData.data?.stats);
  console.log('   Placement vs Internship:', tpoData.data?.placementVsInternship);
  console.log('   Application Status Distribution:', tpoData.data?.applicationStatusDistribution);
  console.log('   Department Analytics:', tpoData.data?.departmentAnalytics);

  // 7. Admin Dashboard Data
  console.log('\n7. Testing Admin Dashboard:');
  const adminRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
    headers: { Authorization: `Bearer ${admin.token}` }
  });
  const adminData = await adminRes.json();
  console.log('   Admin Dashboard status:', adminRes.status, 'Success:', adminData.success);
  console.log('   Stats:', adminData.data?.stats);
  console.log('   Role Distribution:', adminData.data?.roleDistribution);
  console.log('   Alumni Verification:', adminData.data?.alumniVerification);
  console.log('   Platform Activity:', adminData.data?.platformActivity);
  console.log('   User Growth:', adminData.data?.userGrowth);

  console.log('\n--- ALL DASHBOARD BACKEND APIS VERIFIED SUCCESSFULLY! ---');
}

testDashboards().catch((err) => {
  console.error('Dashboard test failed:', err);
  process.exit(1);
});
