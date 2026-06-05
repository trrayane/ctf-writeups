'use strict';

// Seeds the emulator's Firestore + Auth state before Admit opens to participants.
// Runs once per container start (idempotent — safe to re-run).
//
// Env expected:
//   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
//   FIREBASE_PROJECT=admit-mctf
//   FLAG (optional override)

const admin = require('firebase-admin');

const PROJECT = process.env.FIREBASE_PROJECT || 'admit-mctf';
const FLAG = process.env.FLAG || 'mctf{0obc0d3s_@r3_n0t_pr1v@t3}';

admin.initializeApp({ projectId: PROJECT });
const db = admin.firestore();
const auth = admin.auth();

async function upsertUser({ uid, email, password, displayName, emailVerified, claims, profile }) {
  try {
    await auth.getUser(uid);
    // already exists — update a subset
    await auth.updateUser(uid, { email, emailVerified, displayName, password });
  } catch {
    await auth.createUser({ uid, email, password, emailVerified, displayName });
  }
  if (claims) await auth.setCustomUserClaims(uid, claims);
  if (profile) await db.doc(`users/${uid}`).set(profile, { merge: true });
}

async function main() {
  // ── Teams (public roster) ────────────────────────────────────────────────
  const teams = [
    { id: 'team-arcana',  name: 'Arcana',       members: 4, captain: 'zeref@microclub.info' },
    { id: 'team-bastion', name: 'Bastion',      members: 5, captain: 'ops@microclub.info' },
    { id: 'team-rune',    name: 'Rune-forgers', members: 3, captain: 'rune@microclub.info' },
  ];
  for (const t of teams) {
    await db.doc(`teams/${t.id}`).set(t, { merge: true });
  }

  // ── Seed staff + a handful of applications ──────────────────────────────
  await upsertUser({
    uid: 'zeref',
    email: 'zeref@microclub.info',
    password: 'r@v3nk33p3r',
    displayName: 'Zeref',
    emailVerified: true,
    claims: { role: 'admin' },
    profile: { email: 'zeref@microclub.info', displayName: 'Zeref', role: 'admin', createdAt: Date.now() },
  });

  await upsertUser({
    uid: 'reviewer-1',
    email: 'ops@microclub.info',
    password: 'ops-temp-pw',
    displayName: 'Ops (temp)',
    emailVerified: true,
    claims: { role: 'reviewer' },
    profile: { email: 'ops@microclub.info', displayName: 'Ops', role: 'reviewer', createdAt: Date.now() },
  });

  const apps = [
    { id: 'app-alpha',  submitterUid: 'applicant-1', team: 'Phoenix',    motivation: 'We want to learn and ship.', status: 'pending' },
    { id: 'app-beta',   submitterUid: 'applicant-2', team: 'NullByte',   motivation: 'Repeat offenders, here for the CTF.', status: 'pending' },
    { id: 'app-gamma',  submitterUid: 'applicant-3', team: 'Root Access',motivation: 'Third attempt. Please accept.', status: 'accepted' },
    { id: 'app-delta',  submitterUid: 'applicant-4', team: 'SysCallMe',  motivation: 'We write exploits, not poetry.', status: 'refused' },
  ];
  for (const a of apps) {
    await db.doc(`applications/${a.id}`).set({
      ...a,
      createdAt: Date.now(),
      reviewedBy: a.status === 'pending' ? null : 'zeref',
    }, { merge: true });
  }

  // ── Sealed verdict archive — admin-only. Flag lives here. ───────────────
  await db.doc('sealed_verdicts/secret').set({
    title: 'Final committee rulings — confidential',
    author: 'zeref@microclub.info',
    note: 'Finalists roster for MCTF 5.0 — do not distribute.',
    flag: FLAG,
    kubescale_note: 'KubeScale is at https://kubescale.mctf.microclub.info. ' +
                    'Emergency bootstrap token (dashboard): KSBT-ZEREF-0xdeadbeef. ' +
                    'Rotate weekly. — z.',
    sealedAt: Date.now(),
  }, { merge: true });

  await db.doc('sealed_verdicts/restricted').set({
    title: 'Restricted accounts — audit trail',
    entries: [
      { team: 'banished-one', reason: 'plagiarism, MCTF 3.0' },
      { team: 'ghost-crew',   reason: 'harassment complaint, MCTF 4.0' },
    ],
    sealedAt: Date.now(),
  }, { merge: true });

  console.log('[seed] done');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('[seed] failed:', e);
  process.exit(1);
});
