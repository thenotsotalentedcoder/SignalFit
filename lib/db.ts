import { Pool, PoolClient } from 'pg';

let pool: Pool | undefined;
export function db() { if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured'); return pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }); }
export async function withUser<T>(userId: string, fn: (c: PoolClient) => Promise<T>) {
  const client = await db().connect();
  try { await client.query('begin'); await client.query("select set_config('app.user_id', $1, true)", [userId]); const result = await fn(client); await client.query('commit'); return result; }
  catch (e) { await client.query('rollback'); throw e; } finally { client.release(); }
}
