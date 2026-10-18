require('dotenv').config();
const assert = require('assert');
const http = require('http');
const app = require('./app');
const { generateToken } = require('./utils/jwt');
const { findUserByEmailWithPassword } = require('./services/userStore.service');
const { getOrCreateConversation } = require('./services/chatStore.service');

const runChatRestTests = async () => {
  console.log('\n======================================================');
  console.log('  💬 CAREERBRIDGE — REST CHAT REGRESSION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const testPass = (msg) => {
    console.log(`  ✅ [PASS] ${msg}`);
    passed++;
  };

  const testFail = (msg, err) => {
    console.error(`  ❌ [FAIL] ${msg}: ${err.message}`);
    failed++;
  };

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  const request = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const data = body ? JSON.stringify(body) : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (data) headers['Content-Length'] = Buffer.byteLength(data);

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path,
          method,
          headers,
        },
        (res) => {
          let raw = '';
          res.on('data', (chunk) => (raw += chunk));
          res.on('end', () => {
            try {
              const parsed = raw ? JSON.parse(raw) : null;
              resolve({ status: res.statusCode, data: parsed });
            } catch (e) {
              resolve({ status: res.statusCode, raw });
            }
          });
        }
      );
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  };

  try {
    // 1. Setup Student & Alumni users
    const studentLogin = await request('POST', '/api/auth/login', { email: 'student@demo.com', password: 'demo123' });
    const studentToken = studentLogin.data?.token;

    const rahulLogin = await request('POST', '/api/auth/login', { email: 'student.rahul@demo.com', password: 'demo123' });
    const otherToken = rahulLogin.data?.token;

    const alumni = await findUserByEmailWithPassword('alumni@demo.com');
    assert(studentToken && otherToken && alumni, 'Login must succeed and alumni must exist');

    const conv = await getOrCreateConversation(studentLogin.data.user.id, alumni._id || alumni.id);
    const convId = conv._id || conv.id;

    // Test 1: Unauthenticated request rejected
    const unauth = await request('POST', `/api/chat/conversations/${convId}/messages`, { body: 'Hello' });
    if (unauth.status === 401) {
      testPass('Unauthenticated POST /messages is rejected with 401');
    } else {
      testFail('Unauthenticated POST /messages must return 401', new Error(`Got ${unauth.status}`));
    }

    // Test 2: Empty message body rejected with 400
    const emptyBody = await request('POST', `/api/chat/conversations/${convId}/messages`, { body: '' }, studentToken);
    if (emptyBody.status === 400) {
      testPass('Empty message body rejected with 400 Bad Request');
    } else {
      testFail('Empty message body must return 400', new Error(`Got ${emptyBody.status}`));
    }

    // Test 3: Oversized message body (>2000 chars) rejected with 400
    const longBody = await request(
      'POST',
      `/api/chat/conversations/${convId}/messages`,
      { body: 'a'.repeat(2001) },
      studentToken
    );
    if (longBody.status === 400) {
      testPass('Oversized message (>2000 chars) rejected with 400 Bad Request');
    } else {
      testFail('Oversized message must return 400', new Error(`Got ${longBody.status}`));
    }

    // Test 4: Unauthorized user cannot post to conversation (IDOR prevention)
    const unauthorized = await request(
      'POST',
      `/api/chat/conversations/${convId}/messages`,
      { body: 'Sneaky intrusion' },
      otherToken
    );
    if (unauthorized.status === 403 || unauthorized.status === 404) {
      testPass('Non-participant user blocked from posting message (IDOR defense)');
    } else {
      testFail('Non-participant must be blocked', new Error(`Got ${unauthorized.status}`));
    }

    // Test 5: Successful REST message sending
    const testMsg = `Deployment test message ${Date.now()}`;
    const sent = await request(
      'POST',
      `/api/chat/conversations/${convId}/messages`,
      { body: testMsg },
      studentToken
    );
    if (sent.status === 201 && sent.data?.success && sent.data?.data?.body === testMsg) {
      testPass('Participant sends message via REST and receives 201 with saved payload');
    } else {
      testFail('Valid message send failed', new Error(`Status ${sent.status}: ${JSON.stringify(sent.data)}`));
    }

    // Test 6: Message is returned in conversation history
    const history = await request('GET', `/api/chat/conversations/${convId}/messages`, null, studentToken);
    if (
      history.status === 200 &&
      history.data?.success &&
      Array.isArray(history.data?.data) &&
      history.data.data.some((m) => m.body === testMsg)
    ) {
      testPass('Sent message is persisted and retrieved in GET /messages');
    } else {
      testFail('Message not found in history', new Error(`Status ${history.status}`));
    }
  } catch (err) {
    testFail('Unexpected error during test execution', err);
  } finally {
    server.close();
  }

  console.log('\n======================================================');
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
};

runChatRestTests();
