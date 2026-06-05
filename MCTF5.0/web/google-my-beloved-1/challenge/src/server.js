'use strict';

// Admit — wraps the Firebase emulator suite behind a single public port.
// Boots firebase emulators:start in a child process, waits for them to be up,
// seeds Firestore + Auth, then starts Express with:
//   - static frontend at /
//   - /__/auth/*       → auth emulator      (127.0.0.1:9099)
//   - /__/firestore/*  → firestore emulator (127.0.0.1:8080)
//   - /__/functions/*  → functions emulator (127.0.0.1:5001)
//
// The frontend Firebase SDK is configured to use these /__/* URLs as emulator
// hosts, so the participant only ever touches a single domain/port.

const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = +(process.env.PORT || 3000);
const PROJECT = process.env.FIREBASE_PROJECT || 'admit-mctf';

const EMU = {
  auth:      { host: '127.0.0.1', port: 9099 },
  firestore: { host: '127.0.0.1', port: 8080 },
  functions: { host: '127.0.0.1', port: 5001 },
};

// ─── Boot the Firebase emulators ──────────────────────────────────────────
function startEmulators() {
  const proc = spawn('firebase', [
    'emulators:start',
    '--only', 'auth,firestore,functions',
    '--project', PROJECT,
  ], {
    cwd: __dirname,
    env: { ...process.env },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  proc.on('exit', (code) => {
    console.error(`[emulators] exited with code ${code}, shutting down server`);
    process.exit(1);
  });
  return proc;
}

function tcpAlive(host, port) {
  return new Promise((resolve) => {
    const req = http.request({ host, port, path: '/', method: 'GET', timeout: 500 },
      (res) => { res.resume(); resolve(true); });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function waitForEmulators(timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  for (const [name, { host, port }] of Object.entries(EMU)) {
    while (Date.now() < deadline) {
      if (await tcpAlive(host, port)) { console.log(`[emulators] ${name} up on :${port}`); break; }
      await new Promise((r) => setTimeout(r, 500));
    }
    if (Date.now() >= deadline) throw new Error(`timed out waiting for ${name}`);
  }
}

async function seed() {
  return new Promise((resolve, reject) => {
    const seedProc = spawn('node', ['seed/seed.js'], {
      cwd: __dirname,
      env: {
        ...process.env,
        FIREBASE_AUTH_EMULATOR_HOST: `${EMU.auth.host}:${EMU.auth.port}`,
        FIRESTORE_EMULATOR_HOST: `${EMU.firestore.host}:${EMU.firestore.port}`,
        FIREBASE_PROJECT: PROJECT,
      },
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    seedProc.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`seed exited ${code}`))));
  });
}

// ─── Build the Express surface ────────────────────────────────────────────
function buildApp() {
  const app = express();

  // Serve the frontend bundle from /public.
  app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

  // Inject the Firebase client config at request time (single source of truth).
  app.get('/__/config.json', (_req, res) => {
    res.json({
      project: PROJECT,
      // Same-origin URLs for the Firebase SDK to treat as emulator hosts.
      // The SDK's connectXxxEmulator() takes host+port, so we construct
      // client-side from window.location.
      emulator: {
        auth:      '/__/auth',
        firestore: '/__/firestore',
        functions: '/__/functions',
      },
    });
  });

  // Health / version — used by frontend status card.
  app.get('/__/health', (_req, res) => res.json({ ok: true, product: 'Admit' }));

  // ── Emulator proxies ─────────────────────────────────────────────────────
  // These pass through every path under /__/{auth,firestore,functions}/...
  // to the respective emulator on localhost. The emulator responds with the
  // real Firebase REST shape so the SDK is happy.
  // http-proxy-middleware v2 forwards req.originalUrl, so we need to strip
  // the '/__/<svc>' mount prefix explicitly via pathRewrite.
  const proxyFor = (prefix, target) => createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    xfwd: true,
    logLevel: 'warn',
    pathRewrite: { [`^${prefix}`]: '' },
  });

  app.use('/__/auth',      proxyFor('/__/auth',      `http://${EMU.auth.host}:${EMU.auth.port}`));
  app.use('/__/firestore', proxyFor('/__/firestore', `http://${EMU.firestore.host}:${EMU.firestore.port}`));
  app.use('/__/functions', proxyFor('/__/functions', `http://${EMU.functions.host}:${EMU.functions.port}`));

  app.use((_req, res) => res.status(404).type('text/plain').send('not found'));
  return app;
}

// ─── Bring it all up ──────────────────────────────────────────────────────
(async () => {
  console.log('[admit] starting emulators…');
  startEmulators();
  await waitForEmulators();
  console.log('[admit] emulators ready, seeding…');
  await seed();
  console.log('[admit] seed ok, booting web server.');

  const app = buildApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[admit] listening on :${PORT}`);
  });
})().catch((e) => {
  console.error('[admit] boot failed:', e);
  process.exit(1);
});
