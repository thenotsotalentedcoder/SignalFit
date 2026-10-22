// Live two-account isolation + persistence check. Needs a running server and the migrated DB.
// Usage: BASE=http://localhost:3111 ADMIN_DATABASE_URL=postgres://... node --env-file=.env scripts/e2e-isolation.mjs
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import pg from 'pg';
import { authenticator } from '@otplib/preset-default';

const BASE = process.env.BASE || 'http://localhost:3111';
const admin = new pg.Client({ connectionString: process.env.ADMIN_DATABASE_URL }); await admin.connect();
await admin.query('delete from auth_attempts'); // test hygiene: rate limits are verified separately
const key = crypto.createHash('sha256').update(process.env.SESSION_SECRET).digest();
const dec = (v) => { const [i, t, d] = v.split('.'); const c = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(i, 'base64')); c.setAuthTag(Buffer.from(t, 'base64')); return Buffer.concat([c.update(Buffer.from(d, 'base64')), c.final()]).toString(); };

function client() {
  let cookie = '';
  return async (path, { method = 'GET', body, origin = true } = {}) => {
    const r = await fetch(BASE + path, { method, redirect: 'manual', headers: { 'content-type': 'application/json', ...(cookie && { cookie }), ...(origin && method !== 'GET' && { origin: BASE }) }, body: body ? JSON.stringify(body) : undefined });
    const set = r.headers.getSetCookie?.().find((c) => c.startsWith('signalfit_session=')); if (set) cookie = set.split(';')[0];
    const text = await r.text(); let json; try { json = JSON.parse(text); } catch { json = null; }
    return { status: r.status, json, text };
  };
}
const stamp = Date.now();
async function account(tag) {
  const api = client(); const email = `${tag}${stamp}@example.test`;
  assert.equal((await api('/api/auth/signup', { method: 'POST', body: { email, password: 'correct-horse-9' } })).status, 200);
  assert.equal((await api('/api/auth/totp/enroll', { method: 'POST' })).status, 200);
  const { rows } = await admin.query('select totp_secret_enc from users where email=$1', [email]);
  const v = await api('/api/auth/totp/verify', { method: 'POST', body: { code: authenticator.generate(dec(rows[0].totp_secret_enc)) } });
  assert.equal(v.status, 200, 'totp verify'); return { api, email };
}

const A = await account('a'); const B = await account('b');
console.log('ok  signup + TOTP enroll + AAL2 for two accounts');

// AAL1 session must not reach private data
const aal1 = client(); await aal1('/api/auth/signin', { method: 'POST', body: { email: A.email, password: 'correct-horse-9' } });
assert.equal((await aal1('/api/interview')).status, 401); console.log('ok  AAL1 session rejected from workspace API');
// cross-origin mutation rejected
assert.equal((await A.api('/api/interview', { method: 'POST', body: { field: 'identity', answer: 'x' }, origin: false })).status, 403); console.log('ok  mutation without same Origin rejected');
// A cannot re-enroll once enabled
assert.equal((await A.api('/api/auth/totp/enroll', { method: 'POST' })).status, 409); console.log('ok  enrolled authenticator cannot be replaced');

// Interview isolation + persistence
await A.api('/api/interview', { method: 'POST', body: { field: 'identity', answer: 'Acme Automation, Lahore' } });
assert.equal((await A.api('/api/interview')).json.answers.identity, 'Acme Automation, Lahore');
assert.equal(Object.keys((await B.api('/api/interview')).json.answers).length, 0); console.log('ok  interview answers private per account');
const relogin = client(); const s = await relogin('/api/auth/signin', { method: 'POST', body: { email: A.email, password: 'correct-horse-9' } }); assert.equal(s.json.next, '/2fa');
const secret = dec((await admin.query('select totp_secret_enc from users where email=$1', [A.email])).rows[0].totp_secret_enc);
assert.equal((await relogin('/api/auth/totp/verify', { method: 'POST', body: { code: authenticator.generate(secret) } })).status, 200);
assert.equal((await relogin('/api/interview')).json.answers.identity, 'Acme Automation, Lahore'); console.log('ok  answers persist across fresh signed-in session');

// Interview/profile rules
assert.equal((await A.api('/api/interview', { method: 'POST', body: { field: 'followup_9', answer: 'x' } })).status, 400);
assert.equal((await A.api('/api/profile/confirm', { method: 'POST', body: {} })).status, 409);
const prof = { summary: 'Acme builds integrations.', services: ['APIs'], capabilities: ['Node'], evidence: [], customers: 'SMEs', buyerRoles: [], differentiators: [], preferences: 'fixed scope', constraints: [], unknowns: ['budget'], searchCriteria: [] };
assert.equal((await A.api('/api/profile', { method: 'PATCH', body: prof })).status, 200);
assert.equal((await A.api('/api/profile/confirm', { method: 'POST', body: {} })).status, 409);
assert.equal((await A.api('/api/profile/confirm', { method: 'POST', body: { acknowledgeUnknowns: true } })).status, 200);
assert.equal((await B.api('/api/interview')).json.profile, null);
assert.equal((await A.api('/api/interview')).json.confirmed, true);
assert.equal((await B.api('/api/interview/followup', { method: 'POST', body: { skip: true } })).status, 200);
console.log('ok  profile confirm needs unknown-acknowledgement; B profile untouched; follow-up closes per account');

// Seed an A-owned run/opportunity directly (admin) to test direct-ID access from B
const uid = (await admin.query('select id from users where email=$1', [A.email])).rows[0].id;
const run = (await admin.query("insert into research_runs(owner_id,sector,geography,engagement) values($1,'x','y','project') returning id", [uid])).rows[0].id;
const opp = (await admin.query("insert into opportunities(run_id,title,summary,eligibility) values($1,'t','s','discovery_lead') returning id", [run])).rows[0].id;
for (const [path, method, body] of [[`/api/research/run/${run}`, 'GET'], [`/api/research/run/${run}`, 'POST', { stage: 'collect', urls: ['https://example.com'] }], [`/api/opportunities/${opp}`, 'GET'], [`/api/opportunities/${opp}`, 'PUT', { status: 'saved', note: 'hijack' }], [`/api/opportunities/${opp}/export`, 'GET']]) {
  const r = await B.api(path, { method, body }); assert.equal(r.status, 404, `${method} ${path} as B -> ${r.status}`);
}
assert.equal((await A.api(`/api/opportunities/${opp}`, { method: 'PUT', body: { status: 'worth_investigating', note: 'mine' } })).status, 200);
assert.equal((await B.api('/api/saved')).json.saved.length, 0);
assert.equal((await A.api('/api/saved')).json.saved.length, 1);
const md = await A.api(`/api/opportunities/${opp}/export`); assert.match(md.text, /^# t/); console.log('ok  account B gets 404 on A run/opportunity/export/notes; A can save + export');
// rejected dismiss without reason
assert.equal((await A.api(`/api/opportunities/${opp}`, { method: 'PUT', body: { status: 'dismissed', note: '' } })).status, 400);
// RLS holds even with a hand-written query through the app role
const app = new pg.Client({ connectionString: process.env.DATABASE_URL }); await app.connect();
const bId = (await admin.query('select id from users where email=$1', [B.email])).rows[0].id;
await app.query('begin'); await app.query("select set_config('app.user_id',$1,true)", [bId]);
assert.equal((await app.query('select id from research_runs where id=$1', [run])).rowCount, 0);
assert.equal((await app.query('select id from users where id=$1', [uid])).rowCount, 0); await app.query('rollback');
console.log('ok  PostgreSQL RLS blocks owner-less reads under the app role');
await app.end(); await admin.end(); console.log('ALL PASS');
