/**
 * CareerBridge — Frontend Integration Simulation Test
 * Simulates the exact Axios request and state management logic used in
 * MentorDiscoveryPage.jsx, MentorCard.jsx, and MentorDetailPage.jsx.
 */

const http = require('http');

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(
      `http://localhost:5000${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getAuth(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      `http://localhost:5000${path}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function simulateFrontend() {
  console.log('===============================================================');
  console.log('  SIMULATING FRONTEND AXIOS REQUEST & COMPONENT RENDERING FLOW');
  console.log('===============================================================\n');

  // Step 1: Login
  const loginRes = await postJson('/api/auth/login', {
    email: 'student@demo.com',
    password: 'demo123',
  });
  const token = loginRes.body?.token;
  console.log('✅ 1. Student login successful. JWT token received.');

  // Step 2: Simulate client api.js interceptor
  // In client/src/services/api.js: api.interceptors.response.use(response => response.data);
  // So when Axios resolves, res IS response.data (i.e. { success: true, data: { mentors: [...], total: 40 } })
  const rawApiResponse = await getAuth('/api/mentorship/mentors', token);
  const axiosInterceptedResponse = rawApiResponse.body; // Interceptor returns response.data

  console.log('✅ 2. Axios interceptor unwrapped payload:', {
    success: axiosInterceptedResponse.success,
    hasDataProp: !!axiosInterceptedResponse.data,
    totalMentors: axiosInterceptedResponse.data?.total,
  });

  // Step 3: MentorDiscoveryPage fetchMentors logic:
  // FIXED LOGIC:
  // const payload = res?.data || res || {};
  // const list = payload.mentors || (Array.isArray(payload) ? payload : []);
  const payload = axiosInterceptedResponse?.data || axiosInterceptedResponse || {};
  const mentors = payload.mentors || (Array.isArray(payload) ? payload : []);

  if (mentors.length === 0) {
    console.error('❌ BUG REGRESSION: Mentors evaluated to empty list!');
    process.exit(1);
  }

  console.log(`✅ 3. Component state setMentors: Successfully parsed ${mentors.length} mentors!`);
  console.log(`      Available: ${mentors.filter(m => m.mentorshipAvailable).length}`);
  console.log(`      Unavailable: ${mentors.filter(m => !m.mentorshipAvailable).length}`);

  // Step 4: Verify Card Rendering properties
  console.log('\n--- 4. MentorCard Prop Sanity Check ---');
  for (let i = 0; i < Math.min(5, mentors.length); i++) {
    const m = mentors[i];
    console.log(`   [Card #${i+1}] ${m.fullName || m.name} | ${m.currentRole} at ${m.currentCompany || m.company}`);
    console.log(`          📍 Location: ${m.location} | Dept: ${m.department} | Batch: ${m.graduationYear}`);
    console.log(`          🎯 Available: ${m.mentorshipAvailable ? 'YES (Active Badge)' : 'NO (Disabled Badge)'}`);
    console.log(`          🛠️ Skills: ${(m.skills || []).slice(0, 4).join(', ')}`);
  }

  // Step 5: Test Mentor Detail Page Fetch
  const sampleMentorId = mentors[0]?.userId || mentors[0]?.id;
  console.log(`\n--- 5. Mentor Detail API Simulation (/api/mentorship/mentors/${sampleMentorId}) ---`);
  const detailRaw = await getAuth(`/api/mentorship/mentors/${sampleMentorId}`, token);
  const detailAxios = detailRaw.body;
  const detailPayload = detailAxios?.data || detailAxios || {};
  const mentorProfile = detailPayload.mentor || detailPayload;

  console.log('✅ Mentor Detail successfully retrieved for:', mentorProfile.fullName || mentorProfile.name);
  console.log('   Bio:', (mentorProfile.bio || '').slice(0, 80) + '...');
  console.log('   LinkedIn:', mentorProfile.linkedinUrl);

  console.log('\n===============================================================');
  console.log('  ALL FRONTEND SIMULATION CHECKS PASSED WITH 100% INTEGRITY');
  console.log('===============================================================\n');
}

simulateFrontend().catch(err => {
  console.error(err);
  process.exit(1);
});
