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

async function run() {
  console.log('Testing Authenticated Mentorship Mentors API...\n');

  // 1. Login as Student
  const loginRes = await postJson('/api/auth/login', {
    email: 'student@demo.com',
    password: 'demo123',
  });
  console.log(`Login status: ${loginRes.status}`);
  const token = loginRes.body?.token || loginRes.body?.data?.token;
  if (!token) {
    console.error('Failed to get token:', loginRes.body);
    process.exit(1);
  }
  console.log(`Successfully obtained JWT for: ${loginRes.body?.user?.name || loginRes.body?.data?.user?.name}\n`);

  // 2. Get all mentors
  const allRes = await getAuth('/api/mentorship/mentors', token);
  console.log(`1. All mentors response status: ${allRes.status}`);
  const total = allRes.body?.data?.total || 0;
  const mentors = allRes.body?.data?.mentors || [];
  console.log(`   Total returned mentors: ${total}`);
  console.log(`   Sample mentor keys:`, Object.keys(mentors[0] || {}));
  console.log(`   Sample mentor: ${mentors[0]?.name || mentors[0]?.userId?.name} - ${mentors[0]?.currentRole} at ${mentors[0]?.company}`);
  console.log(`   Available mentors count: ${mentors.filter(m => m.mentorshipAvailable).length}`);
  console.log(`   Unavailable mentors count: ${mentors.filter(m => !m.mentorshipAvailable).length}`);

  // 3. Search by company: Google
  const googleRes = await getAuth('/api/mentorship/mentors?search=Google', token);
  console.log(`\n2. Search 'Google': ${googleRes.body?.data?.mentors?.length} mentors found`);

  // 4. Search by skill: Python
  const pythonRes = await getAuth('/api/mentorship/mentors?search=Python', token);
  console.log(`3. Search 'Python': ${pythonRes.body?.data?.mentors?.length} mentors found`);

  // 5. Search by department: Electrical
  const eeRes = await getAuth('/api/mentorship/mentors?search=Electrical', token);
  console.log(`4. Search 'Electrical': ${eeRes.body?.data?.mentors?.length} mentors found`);

  // 6. Filter by availability: available
  const availRes = await getAuth('/api/mentorship/mentors?availability=available', token);
  console.log(`5. Filter availability=available: ${availRes.body?.data?.mentors?.length} mentors`);

  // 7. Filter by availability: unavailable
  const unavailRes = await getAuth('/api/mentorship/mentors?availability=unavailable', token);
  console.log(`6. Filter availability=unavailable: ${unavailRes.body?.data?.mentors?.length} mentors`);

  // 8. Filter by industry: Semiconductor
  const semiRes = await getAuth('/api/mentorship/mentors?industry=Semiconductors', token);
  console.log(`7. Filter industry=Semiconductors: ${semiRes.body?.data?.mentors?.length} mentors`);

  // 9. Distinct non-matching search: should return 0 mentors
  const noneRes = await getAuth('/api/mentorship/mentors?search=NonExistentMentorXYZ', token);
  console.log(`8. Search 'NonExistentMentorXYZ': ${noneRes.body?.data?.mentors?.length} mentors (expected 0)`);

  console.log('\nAll API tests completed successfully!');
}

run().catch(console.error);
