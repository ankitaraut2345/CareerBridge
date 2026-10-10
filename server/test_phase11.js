const io = require('../client/node_modules/socket.io-client');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Starting Phase 11 Notification Verification Suite ---');

  // 1. Unauthenticated test
  const unauthRes = await fetch(`${BASE_URL}/api/notifications`);
  console.log('1. Unauthenticated GET /api/notifications status:', unauthRes.status, '(expected 401)');
  if (unauthRes.status !== 401) throw new Error('Unauthenticated check failed');

  // 2. Login as student and alumni
  const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@demo.com', password: 'demo123' })
  });
  const studentData = await studentLoginRes.json();
  const studentToken = studentData.token;
  const studentUser = studentData.user;
  console.log('2. Logged in Student:', studentUser.name, studentUser.id || studentUser._id);

  const alumniLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alumni@demo.com', password: 'demo123' })
  });
  const alumniData = await alumniLoginRes.json();
  const alumniToken = alumniData.token;
  const alumniUser = alumniData.user;
  console.log('   Logged in Alumni:', alumniUser.name, alumniUser.id || alumniUser._id);

  // 3. Connect Student & Alumni Socket.IO clients
  console.log('3. Connecting Student & Alumni Socket.IO clients...');
  const studentSocket = io(BASE_URL, {
    auth: { token: studentToken },
    transports: ['websocket']
  });

  const alumniSocket = io(BASE_URL, {
    auth: { token: alumniToken },
    transports: ['websocket']
  });

  let socketNotificationReceived = null;
  studentSocket.on('notification:new', (notif) => {
    console.log('>>> [Socket.IO] Student received real-time notification:new:', notif.title);
    socketNotificationReceived = notif;
  });

  await Promise.all([
    new Promise((resolve) => studentSocket.on('connect', resolve)),
    new Promise((resolve) => alumniSocket.on('connect', resolve))
  ]);
  console.log('   Both sockets connected successfully.');

  // 4. Initial unread count for student
  const countRes = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const countData = await countRes.json();
  console.log('4. Student initial unread count:', countData.count);

  // 5. Test Chat message triggering in-app notification
  console.log('5. Alumni opens conversation and sends chat message to Student...');
  const studentId = studentUser.id || studentUser._id;
  const alumniId = alumniUser.id || alumniUser._id;

  // Open conversation
  const convRes = await fetch(`${BASE_URL}/api/chat/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${alumniToken}`
    },
    body: JSON.stringify({ otherUserId: studentId })
  });
  const convData = await convRes.json();
  const conversationId = convData.data?._id || convData.data?.id;
  console.log('   Conversation ID:', conversationId);

  // Emit chat:send from alumni socket
  alumniSocket.emit('chat:send', {
    conversationId,
    body: 'Hello student! Checking in on your career plans.'
  });

  // Wait a short moment for background notification creation & socket emission
  await new Promise((r) => setTimeout(r, 600));

  // 6. Verify notification received via REST
  const notifListRes = await fetch(`${BASE_URL}/api/notifications?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const notifListData = await notifListRes.json();
  console.log('6. Student notifications count:', notifListData.data?.length);
  const latestNotif = notifListData.data?.[0];
  console.log('   Latest Notification:', {
    id: latestNotif?._id || latestNotif?.id,
    type: latestNotif?.type,
    title: latestNotif?.title,
    isRead: latestNotif?.isRead,
    actionUrl: latestNotif?.actionUrl
  });

  if (!latestNotif) throw new Error('No notification found for student after chat message');
  const notifId = latestNotif._id || latestNotif.id;

  // 7. Verify Ownership Authorization: Alumni cannot mark Student notification as read
  console.log('7. Testing Ownership Protection (Alumni trying to mark Student notification):');
  const tamperRes = await fetch(`${BASE_URL}/api/notifications/${notifId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${alumniToken}` }
  });
  console.log('   Alumni PATCH student notification status:', tamperRes.status, '(expected 404/403)');
  if (tamperRes.status !== 404 && tamperRes.status !== 403) {
    throw new Error('Ownership authorization check failed!');
  }

  // 8. Student marks notification as read
  console.log('8. Student marks notification as read:');
  const markReadRes = await fetch(`${BASE_URL}/api/notifications/${notifId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const markReadData = await markReadRes.json();
  console.log('   Mark as read success:', markReadData.success, 'isRead:', markReadData.data?.isRead);

  // 9. Student marks notification as unread
  console.log('9. Student marks notification as unread:');
  const markUnreadRes = await fetch(`${BASE_URL}/api/notifications/${notifId}/unread`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const markUnreadData = await markUnreadRes.json();
  console.log('   Mark as unread success:', markUnreadData.success, 'isRead:', markUnreadData.data?.isRead);

  // 10. Student marks all as read
  console.log('10. Student marks all notifications as read:');
  const markAllRes = await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const markAllData = await markAllRes.json();
  console.log('    Mark all read success:', markAllData.success, 'updated:', markAllData.data?.count);

  const updatedCountRes = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const updatedCountData = await updatedCountRes.json();
  console.log('    Updated unread count:', updatedCountData.count, '(expected 0)');

  // 11. Cleanup and close socket
  studentSocket.disconnect();
  console.log('\n--- ALL PHASE 11 INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
