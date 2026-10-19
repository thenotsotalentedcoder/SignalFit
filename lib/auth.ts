import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { db, withUser } from './db';
const COOKIE = 'signalfit_session';
function hash(v: string) { return crypto.createHash('sha256').update(v).digest('hex'); }
export async function createSession(userId: string, assurance = 1) { const raw = crypto.randomBytes(32).toString('base64url'); await db().query('insert into sessions(user_id, token_hash, assurance, expires_at) values($1,$2,$3,now()+interval \'30 days\')', [userId, hash(raw), assurance]); cookies().set(COOKIE, raw, { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', path:'/', maxAge:2592000 }); }
export async function currentSession() { const raw = cookies().get(COOKIE)?.value; if (!raw) return null; const r = await db().query('select s.user_id, s.assurance, u.email from sessions s join users u on u.id=s.user_id where s.token_hash=$1 and s.expires_at>now()', [hash(raw)]); return r.rows[0] ?? null; }
export async function requireAAL2() { const s = await currentSession(); if (!s || s.assurance < 2) return null; return s; }
export async function revokeSession() { const raw=cookies().get(COOKIE)?.value; if(raw) await db().query('delete from sessions where token_hash=$1',[hash(raw)]); cookies().delete(COOKIE); }
export async function elevateSession(userId:string) { const raw=cookies().get(COOKIE)?.value; if(!raw) return; await db().query('update sessions set assurance=2, token_hash=$1, expires_at=now()+interval \'30 days\' where token_hash=$2 and user_id=$3',[hash(crypto.randomBytes(32).toString('base64url')),hash(raw),userId]); /* rotate cookie by replacing through a fresh session */ await revokeSession(); await createSession(userId,2); }
export { hash };
