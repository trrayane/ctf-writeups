// Admit — MCTF admissions frontend (REST-only, no Firebase SDK)
// Talks to the Firebase emulator suite through /__/auth, /__/firestore, /__/functions.

const PROJECT = 'admit-mctf';
const API_KEY = 'admit-mctf-dev-key';    // the Auth emulator accepts any key string
const AUTH    = '/__/auth';
const FS      = '/__/firestore';
const FN      = '/__/functions';

const $ = (id) => document.getElementById(id);

// ─── Tiny helpers ──────────────────────────────────────────────────────────
const toast = (msg, kind = '') => {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show ' + kind;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2800);
};

const session = {
  load() {
    const raw = sessionStorage.getItem('admit.session');
    return raw ? JSON.parse(raw) : null;
  },
  save(s) { sessionStorage.setItem('admit.session', JSON.stringify(s)); },
  clear() { sessionStorage.removeItem('admit.session'); },
};

async function api(method, url, body, headers = {}) {
  const opts = {
    method,
    headers: { 'content-type': 'application/json', ...headers },
  };
  if (body != null) opts.body = JSON.stringify(body);
  const r = await fetch(url, opts);
  let data = null;
  try { data = await r.json(); } catch {}
  if (!r.ok) {
    const msg = (data && (data.error?.message || data.message)) || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return data;
}

// ─── Auth (REST) ───────────────────────────────────────────────────────────
async function authSignUp(email, password) {
  const d = await api('POST', `${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    { email, password, returnSecureToken: true });
  session.save({ idToken: d.idToken, refreshToken: d.refreshToken, uid: d.localId, email });
  return d;
}

async function authSignIn(email, password) {
  const d = await api('POST', `${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
    { email, password, returnSecureToken: true });
  session.save({ idToken: d.idToken, refreshToken: d.refreshToken, uid: d.localId, email });
  return d;
}

async function authLookup() {
  const { idToken } = session.load() || {};
  if (!idToken) throw new Error('no session');
  const d = await api('POST', `${AUTH}/identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
    { idToken });
  return d.users?.[0];
}

async function authRefreshToken() {
  const s = session.load();
  if (!s?.refreshToken) throw new Error('no refresh token');
  const r = await fetch(`${AUTH}/securetoken.googleapis.com/v1/token?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(s.refreshToken)}`,
  });
  if (!r.ok) throw new Error(`refresh failed: ${r.status}`);
  const d = await r.json();
  session.save({ ...s, idToken: d.id_token || d.idToken, refreshToken: d.refresh_token || d.refreshToken });
}

// ─── Firestore (REST) ──────────────────────────────────────────────────────
//   Values must be wrapped in Firestore's {stringValue, booleanValue, ...}
//   envelope. Read-side we unwrap back to plain JS.
function fsEncodeValue(v) {
  if (v === null) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(fsEncodeValue) } };
  if (typeof v === 'object') return { mapValue: { fields: fsEncodeFields(v) } };
  throw new Error('unsupported value');
}
function fsEncodeFields(obj) {
  const out = {};
  for (const k of Object.keys(obj)) out[k] = fsEncodeValue(obj[k]);
  return out;
}
function fsDecode(v) {
  if (v == null) return v;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return +v.integerValue;
  if ('doubleValue' in v) return v.doubleValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue?.values || []).map(fsDecode);
  if ('mapValue' in v) return fsDecodeFields(v.mapValue?.fields || {});
  if ('timestampValue' in v) return v.timestampValue;
  return v;
}
function fsDecodeFields(fields) {
  const out = {};
  for (const k of Object.keys(fields)) out[k] = fsDecode(fields[k]);
  return out;
}

function authHeader() {
  const s = session.load();
  return s?.idToken ? { authorization: `Bearer ${s.idToken}` } : {};
}

async function fsGet(path) {
  const url = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`;
  const r = await fetch(url, { headers: { ...authHeader() } });
  if (r.status === 404) return null;
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || `HTTP ${r.status}`);
  return { name: d.name, data: fsDecodeFields(d.fields || {}) };
}

async function fsList(parent) {
  const url = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${parent}`;
  const r = await fetch(url, { headers: { ...authHeader() } });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || `HTTP ${r.status}`);
  return (d.documents || []).map((doc) => ({
    id: doc.name.split('/').pop(),
    data: fsDecodeFields(doc.fields || {}),
  }));
}

async function fsCreate(parent, docId, fields) {
  const url = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${parent}?documentId=${encodeURIComponent(docId)}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...authHeader() },
    body: JSON.stringify({ fields: fsEncodeFields(fields) }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || `HTTP ${r.status}`);
  return d;
}

async function fsPatch(path, fields) {
  const keys = Object.keys(fields);
  const mask = keys.map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const url = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${path}?${mask}`;
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', ...authHeader() },
    body: JSON.stringify({ fields: fsEncodeFields(fields) }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d?.error?.message || `HTTP ${r.status}`);
  return d;
}

// ─── Functions (callable) ──────────────────────────────────────────────────
async function fnCall(name, data = {}) {
  const url = `${FN}/${PROJECT}/us-central1/${name}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...authHeader() },
    body: JSON.stringify({ data }),
  });
  const d = await r.json();
  if (!r.ok) {
    const msg = d?.error?.message || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return d.result;
}

// ─── UI handlers ──────────────────────────────────────────────────────────
function showView() {
  const s = session.load();
  if (s?.idToken) {
    $('login-view').style.display = 'none';
    $('app-view').style.display = 'grid';
    refreshAll();
  } else {
    $('login-view').style.display = 'grid';
    $('app-view').style.display = 'none';
  }
}

async function refreshAll() {
  try {
    const u = await authLookup();
    const claimsB64 = session.load().idToken.split('.')[1];
    const claims = JSON.parse(atob(claimsB64.replace(/-/g, '+').replace(/_/g, '/')));
    const profile = {
      email: u.email, emailVerified: !!u.emailVerified,
      uid: u.localId, displayName: u.displayName || null,
      claims: { role: claims.role || null, email_verified: claims.email_verified || false },
    };
    $('profile-view').textContent = JSON.stringify(profile, null, 2);
    $('user-chip').textContent = u.email + (claims.role ? ` · ${claims.role}` : '');
    if (claims.role === 'admin') $('user-chip').classList.add('admin'); else $('user-chip').classList.remove('admin');
    $('role-flag').textContent = claims.role || 'member';
    $('verified-flag').textContent = u.emailVerified ? 'true' : 'false';

    await loadApplications();
    await loadEligibility();
  } catch (e) {
    toast('lookup failed: ' + e.message, 'err');
    if (/INVALID_ID_TOKEN|expired/i.test(e.message)) session.clear();
    showView();
  }
}

async function loadApplications() {
  try {
    const apps = await fsList('applications');
    const host = $('app-list');
    host.innerHTML = '';
    for (const { id, data } of apps) {
      const el = document.createElement('div');
      el.className = 'app-row';
      el.innerHTML = `
        <div>
          <div class="team">${escapeHtml(data.team || id)}</div>
          <div class="motivation">${escapeHtml(data.motivation || '')}</div>
        </div>
        <span class="status ${data.status}">${data.status}</span>`;
      host.appendChild(el);
    }
    if (!apps.length) host.innerHTML = '<span class="muted small">no applications visible</span>';
  } catch (e) {
    $('app-list').innerHTML = `<span class="muted small">${escapeHtml(e.message)}</span>`;
  }
}

async function loadEligibility() {
  const uid = session.load()?.uid;
  if (!uid) return;
  try {
    const doc = await fsGet(`promotion_eligibility/${uid}`);
    $('elig-view').textContent = doc
      ? JSON.stringify(doc.data, null, 2)
      : '(no eligibility record yet)';
  } catch (e) {
    $('elig-view').textContent = 'error: ' + e.message;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ─── Auth UI ──────────────────────────────────────────────────────────────
let loginMode = 'login';
for (const tab of document.querySelectorAll('.tab')) {
  tab.onclick = () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    loginMode = tab.dataset.tab;
    $('login-submit').textContent = loginMode === 'login' ? 'Sign in' : 'Create account';
  };
}

$('login-submit').onclick = async () => {
  const email = $('login-email').value.trim();
  const pass = $('login-pass').value;
  const msg = $('login-msg');
  msg.className = 'msg';
  msg.textContent = '';
  try {
    if (loginMode === 'signup') {
      await authSignUp(email, pass);
      msg.className = 'msg ok';
      msg.textContent = 'Account created. Verify your email from the Account section.';
    } else {
      await authSignIn(email, pass);
    }
    showView();
  } catch (e) {
    msg.textContent = e.message.replace(/^[A-Z_]+:\s*/, '').toLowerCase();
  }
};

$('btn-logout').onclick = () => { session.clear(); showView(); };

$('btn-refresh-token').onclick = async () => {
  try {
    await authRefreshToken();
    await refreshAll();
    toast('ID token refreshed', 'ok');
  } catch (e) { toast(e.message, 'err'); }
};

$('btn-check-elig').onclick = loadEligibility;

$('btn-create-elig').onclick = async () => {
  const uid = session.load()?.uid;
  try {
    await fsCreate('promotion_eligibility', uid, {
      approved: false,
      requestedAt: String(Date.now()),
    });
    toast('eligibility record created', 'ok');
    loadEligibility();
  } catch (e) { toast(e.message, 'err'); }
};

$('btn-request-promotion').onclick = async () => {
  try {
    const r = await fnCall('requestPromotion');
    toast(r?.message || 'promoted', 'ok');
  } catch (e) { toast(e.message, 'err'); }
};

$('btn-read-verdicts').onclick = async () => {
  try {
    const d = await fsGet('sealed_verdicts/secret');
    $('verdicts-view').innerHTML = '';
    const pre = document.createElement('pre');
    pre.className = 'dump';
    pre.textContent = JSON.stringify(d?.data, null, 2);
    $('verdicts-view').appendChild(pre);
  } catch (e) {
    $('verdicts-view').textContent = 'blocked: ' + e.message;
  }
};

$('btn-change-email').onclick = async () => {
  const newEmail = $('new-email').value.trim();
  if (!newEmail) return toast('enter a new email', 'err');
  try {
    const { idToken, email } = session.load();
    await api('POST', `${AUTH}/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`, {
      requestType: 'VERIFY_AND_CHANGE_EMAIL',
      idToken,
      email,
      newEmail,
    });
    toast('verification code sent to ' + newEmail, 'ok');
  } catch (e) { toast(e.message, 'err'); }
};

// Kick off
showView();
