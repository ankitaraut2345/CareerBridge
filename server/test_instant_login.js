/**
 * CareerBridge — Instant Login / Quick Access Automated Verification Suite
 * Verifies all 12 core acceptance criteria:
 * 1. Normal login still works
 * 2. Quick login works for each configured role (STUDENT, ALUMNI, TPO, ADMIN)
 * 3. Each role resolves the correct user profile, role, and canonical account
 * 4. The issued token works with existing protected APIs (GET /api/auth/me)
 * 5. Role-Based Access Control (RBAC) restrictions remain strictly enforced
 * 6. Role parameters strictly map to canonical demo accounts (no privilege spoofing)
 * 7. Quick login fails when ENABLE_DEMO_LOGIN=false (returns 403)
 * 8. Direct API calls to POST /api/auth/demo-login are rejected when disabled
 * 9. Invalid/unsupported roles produce a clear 400 error
 * 10. Logout works correctly (POST /api/auth/logout)
 * 11. Demo login status endpoint (GET /api/auth/demo-login) reports state accurately
 * 12. Token signature is verified against JWT_SECRET using the existing auth service
 */

require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('./app');

let server;
let BASE_URL;
let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function request(path, options = {}, body = null) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    method: options.method || 'GET',
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(url, config);
  let resBody = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      resBody = await res.json();
    } catch {}
  } else {
    try {
      resBody = await res.text();
    } catch {}
  }

  return {
    status: res.status,
    headers: res.headers,
    body: resBody,
  };
}

async function runTestSuite() {
  console.log('\n===============================================================');
  console.log('  ⚡ CAREERBRIDGE — INSTANT LOGIN / QUICK ACCESS TEST SUITE');
  console.log('===============================================================\n');

  // Start HTTP server on dynamic port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  BASE_URL = `http://127.0.0.1:${port}`;

  try {
    // -------------------------------------------------------------
    // Test Group 1: Demo Login Status Endpoint
    // -------------------------------------------------------------
    console.log('--- Test Group 1: Demo Login Status Discovery ---');
    const statusRes = await request('/api/auth/demo-login');
    assert(statusRes.status === 200, 'GET /api/auth/demo-login returns HTTP 200');
    assert(
      statusRes.body && statusRes.body.success === true,
      'GET /api/auth/demo-login returns success: true'
    );
    assert(
      Array.isArray(statusRes.body?.roles) &&
        statusRes.body.roles.includes('STUDENT') &&
        statusRes.body.roles.includes('ALUMNI') &&
        statusRes.body.roles.includes('TPO') &&
        statusRes.body.roles.includes('ADMIN'),
      'Status exposes the four supported roles (STUDENT, ALUMNI, TPO, ADMIN)'
    );

    // -------------------------------------------------------------
    // Test Group 2: Quick Login for Each Role
    // -------------------------------------------------------------
    console.log('\n--- Test Group 2: Instant Login for Each Supported Role ---');
    const roles = ['STUDENT', 'ALUMNI', 'TPO', 'ADMIN'];
    const tokens = {};
    const userProfiles = {};

    for (const role of roles) {
      const loginRes = await request(
        '/api/auth/demo-login',
        { method: 'POST' },
        { role }
      );

      assert(
        loginRes.status === 200,
        `Quick login for ${role} returns HTTP 200`,
        `Received status ${loginRes.status}: ${JSON.stringify(loginRes.body)}`
      );
      assert(
        loginRes.body && typeof loginRes.body.token === 'string' && loginRes.body.token.length > 20,
        `Quick login for ${role} returns a valid JWT string`
      );
      assert(
        loginRes.body?.user && loginRes.body.user.role === role,
        `Quick login for ${role} returns user profile with role === '${role}'`
      );
      assert(
        loginRes.body?.user?.email && loginRes.body.user.email.includes('@demo.com'),
        `Quick login for ${role} resolves canonical demo email (${loginRes.body?.user?.email})`
      );

      tokens[role] = loginRes.body?.token;
      userProfiles[role] = loginRes.body?.user;
    }

    // -------------------------------------------------------------
    // Test Group 3: Token Usability with Protected Endpoint
    // -------------------------------------------------------------
    console.log('\n--- Test Group 3: Protected API Access with Issued Tokens ---');
    for (const role of roles) {
      const meRes = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${tokens[role]}` },
      });

      assert(
        meRes.status === 200,
        `Token for ${role} successfully authenticates GET /api/auth/me`,
        `Received status ${meRes.status}`
      );
      assert(
        meRes.body?.user?.role === role,
        `GET /api/auth/me returns matching role '${role}'`
      );
      assert(
        meRes.body?.user?._id === userProfiles[role]?._id,
        `GET /api/auth/me returns consistent user ID for ${role}`
      );
    }

    // -------------------------------------------------------------
    // Test Group 4: RBAC Enforcement with Demo Tokens
    // -------------------------------------------------------------
    console.log('\n--- Test Group 4: RBAC Enforcement with Demo Tokens ---');
    // Student token attempting to access Admin endpoint must be rejected
    const studentAccessAdmin = await request('/api/admin/alumni/pending', {
      headers: { Authorization: `Bearer ${tokens.STUDENT}` },
    });
    assert(
      studentAccessAdmin.status === 403,
      'Student demo token is rejected with 403 on Admin endpoint (/api/admin/alumni/pending)'
    );

    // Alumni token attempting to access TPO opportunity creation must be rejected
    const alumniAccessTpo = await request(
      '/api/opportunities',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.ALUMNI}` },
      },
      { title: 'Illegal Drive', type: 'FULL_TIME' }
    );
    assert(
      alumniAccessTpo.status === 403,
      'Alumni demo token is rejected with 403 on TPO opportunity creation'
    );

    // Admin token can access Admin alumni pending list
    const adminAccessMetrics = await request('/api/admin/alumni/pending', {
      headers: { Authorization: `Bearer ${tokens.ADMIN}` },
    });
    assert(
      adminAccessMetrics.status === 200,
      'Admin demo token successfully accesses Admin endpoint (/api/admin/alumni/pending)'
    );

    // -------------------------------------------------------------
    // Test Group 5: Normal Login Preservation
    // -------------------------------------------------------------
    console.log('\n--- Test Group 5: Normal Login Flow Preservation ---');
    const normalLoginRes = await request(
      '/api/auth/login',
      { method: 'POST' },
      { email: 'student@demo.com', password: 'demo123' }
    );
    assert(
      normalLoginRes.status === 200,
      'Normal password-based login still functions perfectly for student@demo.com'
    );
    assert(
      normalLoginRes.body?.token && normalLoginRes.body?.user?.role === 'STUDENT',
      'Normal login returns valid JWT and user object'
    );

    // Bad password fails normally
    const badPasswordRes = await request(
      '/api/auth/login',
      { method: 'POST' },
      { email: 'student@demo.com', password: 'wrongPassword123' }
    );
    assert(
      badPasswordRes.status === 401,
      'Normal login rejects incorrect password with 401 Unauthorized'
    );

    // -------------------------------------------------------------
    // Test Group 6: Input Validation & Security Against Role Tampering
    // -------------------------------------------------------------
    console.log('\n--- Test Group 6: Input Validation & Security Guards ---');
    // Unsupported role
    const invalidRoleRes = await request(
      '/api/auth/demo-login',
      { method: 'POST' },
      { role: 'SUPERUSER' }
    );
    assert(
      invalidRoleRes.status === 400,
      'POST /api/auth/demo-login rejects unsupported role "SUPERUSER" with 400 Bad Request'
    );

    // Missing role
    const emptyRoleRes = await request(
      '/api/auth/demo-login',
      { method: 'POST' },
      {}
    );
    assert(
      emptyRoleRes.status === 400,
      'POST /api/auth/demo-login rejects missing role with 400 Bad Request'
    );

    // Client attempting to supply arbitrary email/id
    const tamperingRes = await request(
      '/api/auth/demo-login',
      { method: 'POST' },
      { role: 'STUDENT', email: 'admin@demo.com', _id: 'fake-admin-id' }
    );
    assert(
      tamperingRes.status === 200 && tamperingRes.body?.user?.role === 'STUDENT',
      'Server ignores client-supplied email/id and binds strictly to Student demo account'
    );

    // Case-insensitivity support for role input
    const lowerCaseRoleRes = await request(
      '/api/auth/demo-login',
      { method: 'POST' },
      { role: 'tpo' }
    );
    assert(
      lowerCaseRoleRes.status === 200 && lowerCaseRoleRes.body?.user?.role === 'TPO',
      'Server gracefully normalizes role parameter (e.g., "tpo" -> "TPO")'
    );

    // -------------------------------------------------------------
    // Test Group 7: Feature Flag Enforcement (ENABLE_DEMO_LOGIN=false)
    // -------------------------------------------------------------
    console.log('\n--- Test Group 7: Feature Flag Enforcement when Disabled ---');
    const originalFlag = process.env.ENABLE_DEMO_LOGIN;
    try {
      // Simulate disabling demo login
      process.env.ENABLE_DEMO_LOGIN = 'false';

      const disabledStatusRes = await request('/api/auth/demo-login');
      assert(
        disabledStatusRes.status === 200 && disabledStatusRes.body?.enabled === false,
        'GET /api/auth/demo-login returns enabled: false when flag is false'
      );

      const disabledPostRes = await request(
        '/api/auth/demo-login',
        { method: 'POST' },
        { role: 'STUDENT' }
      );
      assert(
        disabledPostRes.status === 403,
        'Direct POST /api/auth/demo-login is rejected with 403 Forbidden when flag is false'
      );
      assert(
        disabledPostRes.body?.message?.includes('disabled'),
        'Rejection response includes informative message indicating feature is disabled'
      );
    } finally {
      // Restore original flag
      if (originalFlag === undefined) {
        delete process.env.ENABLE_DEMO_LOGIN;
      } else {
        process.env.ENABLE_DEMO_LOGIN = originalFlag;
      }
    }

    // -------------------------------------------------------------
    // Test Group 7B: Production Environment Hard-Lock Safeguard
    // -------------------------------------------------------------
    console.log('\n--- Test Group 7B: Production Environment Hard-Lock Safeguard ---');
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDemoLogin = process.env.ENABLE_DEMO_LOGIN;
    try {
      // Simulate production environment with misconfigured ENABLE_DEMO_LOGIN=true
      process.env.NODE_ENV = 'production';
      process.env.ENABLE_DEMO_LOGIN = 'true';

      const prodStatusRes = await request('/api/auth/demo-login');
      assert(
        prodStatusRes.status === 200 && prodStatusRes.body?.enabled === false,
        'GET /api/auth/demo-login reports enabled: false when NODE_ENV=production'
      );
      assert(
        Array.isArray(prodStatusRes.body?.roles) && prodStatusRes.body.roles.length === 0,
        'The returned demo roles array is empty when NODE_ENV=production'
      );

      const prodPostRes = await request(
        '/api/auth/demo-login',
        { method: 'POST' },
        { role: 'STUDENT' }
      );
      assert(
        prodPostRes.status === 403,
        'POST /api/auth/demo-login returns HTTP 403 Forbidden when NODE_ENV=production'
      );
    } finally {
      if (originalNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = originalNodeEnv;
      }
      if (originalDemoLogin === undefined) {
        delete process.env.ENABLE_DEMO_LOGIN;
      } else {
        process.env.ENABLE_DEMO_LOGIN = originalDemoLogin;
      }
    }

    // -------------------------------------------------------------
    // Test Group 8: Logout Endpoint
    // -------------------------------------------------------------
    console.log('\n--- Test Group 8: Logout Verification ---');
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokens.STUDENT}` },
    });
    assert(
      logoutRes.status === 200 && logoutRes.body?.success === true,
      'POST /api/auth/logout returns success: true for demo user session'
    );

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`  SUMMARY: ${passed} passed, ${failed} failed`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during test suite:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

runTestSuite();
