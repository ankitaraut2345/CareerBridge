// Node CommonJS shim to load demo fixtures in test suite
const fs = require('fs');
const path = require('path');

const fixturePath = path.join(__dirname, '../client/src/fixtures/demoSandboxFixtures.js');
let content = fs.readFileSync(fixturePath, 'utf8');

// Convert ESM exports to CommonJS for Node test execution
content = content.replace(/export const DEMO_USERS/g, 'const DEMO_USERS');
content = content.replace(/export const createInitialSandboxData/g, 'const createInitialSandboxData');
content += '\nmodule.exports = { DEMO_USERS, createInitialSandboxData };\n';

const m = new module.constructor();
m._compile(content, fixturePath);

module.exports = m.exports;
