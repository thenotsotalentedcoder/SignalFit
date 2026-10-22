/** Browser helper: JSON request that never throws on non-JSON bodies. */
export async function api(url: string, method = 'GET', body?: unknown) {
  const r = await fetch(url, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({ error: 'Unexpected server response.' }));
  return { ok: r.ok, status: r.status, data };
}
