import { NextResponse } from 'next/server';
import { withAuth } from './db';

/** Mutations must come from this app's own origin (cookies are SameSite=Lax; this closes same-site gaps). */
export function checkOrigin(req: Request) {
  const origin = req.headers.get('origin'); const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try { if (origin && host && new URL(origin).host === host) return null; } catch { /* fall through */ }
  return NextResponse.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
}
export function clientIp(req: Request) { return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local'; }
/** Fixed-window counter in auth_attempts. Returns false once `max` attempts in `windowSec` are exceeded. */
export async function allow(key: string, max: number, windowSec: number) {
  const r = await withAuth((c) => c.query(
    `insert into auth_attempts(key,attempts,window_started_at) values($1,1,now())
     on conflict(key) do update set
       attempts = case when auth_attempts.window_started_at < now() - make_interval(secs => $2) then 1 else auth_attempts.attempts + 1 end,
       window_started_at = case when auth_attempts.window_started_at < now() - make_interval(secs => $2) then now() else auth_attempts.window_started_at end
     returning attempts`, [key, windowSec]));
  return r.rows[0].attempts <= max;
}
export const tooMany = () => NextResponse.json({ error: 'Too many attempts. Please wait and try again.' }, { status: 429 });
