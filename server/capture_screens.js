const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ARTIFACT_DIR = 'C:\\Users\\91969\\.gemini\\antigravity-ide\\brain\\13e867da-95b9-480c-adc2-a65b3bb2e4fc';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function postJson(pathUrl, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(
      `http://localhost:5000${pathUrl}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
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

async function main() {
  console.log('1. Logging in as Demo Student to get JWT token...');
  const loginRes = await postJson('/api/auth/login', {
    email: 'student@demo.com',
    password: 'demo123',
  });
  const token = loginRes.body?.token;
  if (!token) {
    throw new Error('Failed to obtain JWT token: ' + JSON.stringify(loginRes.body));
  }
  console.log('Token successfully obtained!');

  console.log('2. Launching headless Chrome on debug port 9222...');
  const tempProfileDir = path.join(require('os').tmpdir(), 'chrome_careerbridge_' + Date.now());
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tempProfileDir}`,
    '--window-size=1400,920',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  chromeProcess.stderr.on('data', (d) => {
    // console.log('[Chrome]', d.toString());
  });

  // Wait for Chrome remote debugging port to open
  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const info = await res.json();
        wsUrl = info.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
  }

  if (!wsUrl) {
    chromeProcess.kill();
    throw new Error('Chrome did not open remote debugging port 9222 in time.');
  }

  console.log('Chrome debug WebSocket URL:', wsUrl);

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      cb(data);
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      callbacks.set(id, (res) => {
        if (res.error) {
          reject(new Error(res.error.message));
        } else {
          resolve(res.result);
        }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function capturePage(targetUrl, outputFileName, waitTimeMs = 3000) {
    console.log(`Navigating to: ${targetUrl}`);
    const { targetId } = await send('Target.createTarget', { url: targetUrl });
    const { sessionId } = await send('Target.attachToTarget', {
      targetId,
      flatten: true,
    });

    function sendSession(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, (res) => {
          if (res.error) {
            reject(new Error(res.error.message));
          } else {
            resolve(res.result);
          }
        });
        ws.send(JSON.stringify({ id, sessionId, method, params }));
      });
    }

    await sendSession('Page.enable');
    await sendSession('Emulation.setDeviceMetricsOverride', {
      width: 1400,
      height: 950,
      deviceScaleFactor: 1,
      mobile: false,
    });

    console.log(`Waiting ${waitTimeMs}ms for render...`);
    await sleep(waitTimeMs);

    const { data } = await sendSession('Page.captureScreenshot', {
      format: 'png',
    });

    const outPath = path.join(ARTIFACT_DIR, outputFileName);
    fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot to: ${outPath} (${Math.round(data.length * 0.75 / 1024)} KB)`);

    await send('Target.closeTarget', { targetId });
    return outPath;
  }

  // 1. Alumni Directory Full View
  await capturePage(
    `http://localhost:5173/student/mentors?token=${token}`,
    'alumni_directory_all.png',
    4000
  );

  // 2. Alumni Directory Filtered by Search 'Google'
  await capturePage(
    `http://localhost:5173/student/mentors?token=${token}&search=Google`,
    'alumni_directory_search_google.png',
    3000
  );

  // 3. Alumni Directory with Unavailable Mentors Filter
  await capturePage(
    `http://localhost:5173/student/mentors?token=${token}&availability=unavailable`,
    'alumni_directory_unavailable.png',
    3000
  );

  // 4. Mentor Detail Profile (Priya Sharma - Available & Connected)
  await capturePage(
    `http://localhost:5173/student/mentors/demo_alumni?token=${token}`,
    'alumni_mentor_detail_priya.png',
    3500
  );

  // 5. Mentor Detail Profile (Deepika Menon - Unavailable for Mentorship)
  await capturePage(
    `http://localhost:5173/student/mentors/alumni_deepika?token=${token}`,
    'alumni_mentor_detail_unavailable.png',
    3500
  );

  // Close WebSocket & Chrome
  ws.close();
  chromeProcess.kill();
  console.log('\nAll screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Fatal error capturing screenshots:', err);
  process.exit(1);
});
