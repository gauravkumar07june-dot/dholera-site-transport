/**
 * Dholera Site Transport — login codes by email (Google Apps Script).
 *
 * What it does
 *   1. The website sends an @lntecc.com email → this script emails a 6-digit code from your Gmail.
 *   2. The website sends back the code → this script checks it and returns a one-time Firebase
 *      sign-in token. The person is then signed in on that phone (stays signed in, works offline).
 *
 * Setup (once): see README.md → "Login codes by email". In short:
 *   - Paste this file into a new project at https://script.google.com (signed in as the Gmail that should send the codes).
 *   - Project Settings → Script properties → add SERVICE_ACCOUNT_JSON = the whole Firebase service-account .json file.
 *   - Run testSetup, then testEmail (allow the permissions it asks for).
 *   - Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone → copy the /exec URL into firebase-config.js.
 *
 * Limits: a free Gmail account can email 100 people per day. Each person needs a code only once per phone.
 */

const PROJECT_ID = 'dholera-project-cdcfe';
const DOMAIN = 'lntecc.com';
const APP_NAME = 'Dholera Site Transport';
const CODE_MINUTES = 10;          // a code works for 10 minutes
const MAX_TRIES = 5;              // wrong attempts before the code is cancelled
const RESEND_SECONDS = 60;        // wait between two codes for the same email
const MAX_SENDS_PER_HOUR = 5;     // codes per email per hour
const MAX_ALL_PER_HOUR = 60;      // codes for everyone per hour (protects the daily Gmail limit)

/* ---------- web app ---------- */
function doGet() {
  return json({ ok: true, service: APP_NAME, emailsLeftToday: MailApp.getRemainingDailyQuota() });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const email = String(body.email || '').trim().toLowerCase();
    if (!isLntEmail(email)) return json({ ok: false, error: 'domain' });
    if (body.action === 'send') return json(sendCode(email));
    if (body.action === 'verify') return json(verifyCode(email, String(body.code || '').replace(/\D/g, '')));
    return json({ ok: false, error: 'bad_request' });
  } catch (err) {
    console.error(err && err.stack || err);
    return json({ ok: false, error: 'server' });
  }
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function isLntEmail(e) {
  return new RegExp('^[^@\\s]+@' + DOMAIN.replace(/\./g, '\\.') + '$').test(e);
}

/* ---------- step 1: email a code ---------- */
function sendCode(email) {
  const cache = CacheService.getScriptCache();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const now = Date.now();
    const last = Number(cache.get('last:' + email) || 0);
    if (now - last < RESEND_SECONDS * 1000) {
      return { ok: false, error: 'wait', wait: Math.ceil((RESEND_SECONDS * 1000 - (now - last)) / 1000) };
    }
    const mine = Number(cache.get('hour:' + email) || 0);
    if (mine >= MAX_SENDS_PER_HOUR) return { ok: false, error: 'rate' };
    const hourKey = 'all:' + Math.floor(now / 3600000);
    const all = Number(cache.get(hourKey) || 0);
    if (all >= MAX_ALL_PER_HOUR) return { ok: false, error: 'busy' };
    if (MailApp.getRemainingDailyQuota() < 1) return { ok: false, error: 'quota' };

    const code = newCode();
    cache.put('otp:' + email, JSON.stringify({ h: hash(email + ':' + code), t: 0, e: now + CODE_MINUTES * 60000 }), CODE_MINUTES * 60);
    cache.put('last:' + email, String(now), RESEND_SECONDS * 2);
    cache.put('hour:' + email, String(mine + 1), 3600);
    cache.put(hourKey, String(all + 1), 3600);

    const plain = `Your ${APP_NAME} login code is ${code}\n\nIt works for ${CODE_MINUTES} minutes. If you did not ask for this code, ignore this email.`;
    const html =
      `<div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #DCE5EC;border-radius:14px">` +
      `<div style="font-size:18px;font-weight:bold;color:#0B2A4A">${APP_NAME}</div>` +
      `<p style="color:#56657A;margin:6px 0 18px">TSMPL Dholera FAB site · staff vehicles</p>` +
      `<p style="margin:0 0 8px">Your login code is</p>` +
      `<div style="font-size:34px;letter-spacing:8px;font-weight:bold;color:#0E7C86;font-family:monospace">${code}</div>` +
      `<p style="color:#56657A;font-size:13px;margin-top:18px">It works for ${CODE_MINUTES} minutes. Do not share it. ` +
      `If you did not ask for this code, ignore this email.</p></div>`;
    MailApp.sendEmail({ to: email, subject: `${code} is your ${APP_NAME} login code`, body: plain, htmlBody: html, name: APP_NAME });
    return { ok: true, minutes: CODE_MINUTES };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- step 2: check the code, sign in ---------- */
function verifyCode(email, code) {
  const cache = CacheService.getScriptCache();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let uid;
  try {
    const raw = cache.get('otp:' + email);
    if (!raw) return { ok: false, error: 'expired' };
    const o = JSON.parse(raw);
    if (Date.now() > o.e) { cache.remove('otp:' + email); return { ok: false, error: 'expired' }; }
    if (o.t >= MAX_TRIES) { cache.remove('otp:' + email); return { ok: false, error: 'attempts' }; }
    if (code.length !== 6 || hash(email + ':' + code) !== o.h) {
      o.t++;
      const left = MAX_TRIES - o.t;
      if (left <= 0) cache.remove('otp:' + email);
      else cache.put('otp:' + email, JSON.stringify(o), Math.max(1, Math.ceil((o.e - Date.now()) / 1000)));
      return { ok: false, error: left <= 0 ? 'attempts' : 'wrong', left: Math.max(0, left) };
    }
    cache.remove('otp:' + email);
  } finally {
    lock.releaseLock();
  }
  const u = ensureUser(email);
  if (u.disabled) return { ok: false, error: 'disabled' };
  return { ok: true, token: customToken(u.uid) };
}

/* ---------- helpers ---------- */
function newCode() {
  const b = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now());
  const n = (((b[0] & 255) << 24) | ((b[1] & 255) << 16) | ((b[2] & 255) << 8) | (b[3] & 255)) >>> 0;
  return String(n % 1000000).padStart(6, '0');
}
function hash(s) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s + ':' + PROJECT_ID));
}
function serviceAccount() {
  const raw = PropertiesService.getScriptProperties().getProperty('SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('Script property SERVICE_ACCOUNT_JSON is missing. Paste the Firebase service-account .json file there.');
  return JSON.parse(raw);
}
function b64u(x) {
  const bytes = typeof x === 'string' ? Utilities.newBlob(x).getBytes() : x;
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
}
function signJwt(claims, sa) {
  const head = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify(claims));
  const sig = Utilities.computeRsaSha256Signature(head + '.' + body, sa.private_key);
  return head + '.' + body + '.' + b64u(sig);
}
function accessToken() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('sa_token');
  if (hit) return hit;
  const sa = serviceAccount(), now = Math.floor(Date.now() / 1000);
  const assertion = signJwt({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600
  }, sa);
  const r = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post', muteHttpExceptions: true,
    payload: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: assertion }
  });
  const j = JSON.parse(r.getContentText() || '{}');
  if (!j.access_token) throw new Error('Could not get a Google access token: ' + r.getContentText());
  cache.put('sa_token', j.access_token, 3000);
  return j.access_token;
}
function identityToolkit(path, payload) {
  const r = UrlFetchApp.fetch('https://identitytoolkit.googleapis.com/v1/projects/' + PROJECT_ID + path, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + accessToken() }, payload: JSON.stringify(payload)
  });
  const code = r.getResponseCode(), txt = r.getContentText();
  if (code >= 300) throw new Error(path + ' failed ' + code + ': ' + txt);
  return JSON.parse(txt || '{}');
}
// Finds the Firebase user for this email (keeps the same account and rides), or creates it. Marks the email as verified.
function ensureUser(email) {
  const found = identityToolkit('/accounts:lookup', { email: [email] });
  if (found.users && found.users.length) {
    const u = found.users[0];
    if (u.disabled) return { disabled: true };
    if (!u.emailVerified) identityToolkit('/accounts:update', { localId: u.localId, emailVerified: true });
    return { uid: u.localId };
  }
  const made = identityToolkit('/accounts', { email: email, emailVerified: true });
  return { uid: made.localId };
}
function customToken(uid) {
  const sa = serviceAccount(), now = Math.floor(Date.now() / 1000);
  return signJwt({
    iss: sa.client_email, sub: sa.client_email,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now, exp: now + 3600, uid: uid
  }, sa);
}

/* ---------- run these from the editor during setup ---------- */
// 1. Checks the service account works. The log should show the admin's Firebase account.
function testSetup() {
  Logger.log('Emails left today: ' + MailApp.getRemainingDailyQuota());
  Logger.log('Access token OK: ' + accessToken().slice(0, 10) + '…');
  Logger.log(JSON.stringify(identityToolkit('/accounts:lookup', { email: ['gaurav.kumar21@lntecc.com'] })));
}
// 2. Sends a real code to the admin's L&T email. Check that it arrives in Outlook.
function testEmail() {
  CacheService.getScriptCache().remove('last:gaurav.kumar21@lntecc.com');
  Logger.log(JSON.stringify(sendCode('gaurav.kumar21@lntecc.com')));
}
