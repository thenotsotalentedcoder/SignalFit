import { Pool, PoolClient } from 'pg';

let pool: Pool | undefined;
export function db() { if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured'); return pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }); }
async function inTransaction<T>(setup: (c: PoolClient) => Promise<void>, fn: (c: PoolClient) => Promise<T>) {
  const client = await db().connect();
  try { await client.query('begin'); await setup(client); const result = await fn(client); await client.query('commit'); return result; }
  catch (e) { await client.query('rollback'); throw e; } finally { client.release(); }
}
/** Owner-scoped transaction: RLS policies resolve app.user_id. */
export function withUser<T>(userId: string, fn: (c: PoolClient) => Promise<T>) {
  return inTransaction(async (c) => { await c.query("select set_config('app.user_id', $1, true)", [userId]); }, fn);
}
/** Pre-session auth work only (signup, signin, session lookup, rate limits). Never use for private data. */
export function withAuth<T>(fn: (c: PoolClient) => Promise<T>) {
  return inTransaction(async (c) => { await c.query("select set_config('app.auth', '1', true)"); }, fn);
}
export async function authQuery(sql: string, params: unknown[] = []) { return withAuth((c) => c.query(sql, params)); }
