import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { authQuery } from './db';
const COOKIE = 'signalfit_session';
function requireSecret() { const value = process.env.SESSION_SECRET; if (!value || value.length < 32) throw new Error('SESSION_SECRET must be configured with at least 32 characters'); return value; }
export function hash(v:string) { return crypto.createHash('sha256').update(v).digest('hex'); }
function token() { return crypto.randomBytes(32).toString('base64url'); }
function setCookie(value:string) { cookies().set(COOKIE,value,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:2592000}); }
export async function createSession(userId:string, assurance=1) { requireSecret(); const raw=token(); await authQuery("insert into sessions(user_id,token_hash,assurance,expires_at) values($1,$2,$3,now()+interval '30 days')",[userId,hash(raw),assurance]); setCookie(raw); }
export async function currentSession() { requireSecret(); const raw=cookies().get(COOKIE)?.value; if(!raw)return null; const r=await authQuery('select s.user_id,s.assurance,u.email,u.totp_enabled from sessions s join users u on u.id=s.user_id where s.token_hash=$1 and s.expires_at>now()',[hash(raw)]); return r.rows[0]??null; }
export async function requireAAL2(){const s=await currentSession();return s&&s.assurance>=2?s:null;}
export async function revokeSession(){const raw=cookies().get(COOKIE)?.value;if(raw)await authQuery('delete from sessions where token_hash=$1',[hash(raw)]);cookies().delete(COOKIE);}
export async function elevateSession(userId:string){ requireSecret(); const raw=cookies().get(COOKIE)?.value; if(!raw)return false; const next=token(); const result=await authQuery("update sessions set assurance=2,token_hash=$1,expires_at=now()+interval '30 days' where token_hash=$2 and user_id=$3",[hash(next),hash(raw),userId]); if(result.rowCount!==1)return false; setCookie(next); return true; }
