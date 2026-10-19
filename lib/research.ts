import { URL } from 'node:url';
import dns from 'node:dns/promises';

const PRIVATE = /^(localhost|.*\.local|127\.|10\.|192\.168\.|169\.254\.|0\.)/i;
export function safeUrl(input: string) {
  const u = new URL(input);
  if (!['http:', 'https:'].includes(u.protocol) || PRIVATE.test(u.hostname) || u.hostname === '::1') throw new Error('Only public HTTP(S) URLs are allowed.');
  return u;
}
export function canonical(input: string) { const u = safeUrl(input); u.hash = ''; u.search = ''; return u.toString().replace(/\/$/, ''); }
async function assertPublic(url: string) { const host = new URL(url).hostname; const records = await dns.lookup(host, { all: true }); if (records.some((r) => PRIVATE.test(r.address) || r.address === '::1')) throw new Error('Private or local destinations are blocked.'); }
export async function inspect(input: string) {
  let url = canonical(input); await assertPublic(url);
  try {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'SignalFit research reader/1.0' } });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location'); if (!location) throw new Error('Redirect without destination');
      url = canonical(new URL(location, url).toString()); await assertPublic(url);
      const redirected = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'SignalFit research reader/1.0' } });
      return parseResponse(redirected, url);
    }
    return parseResponse(response, url);
  } catch (error) { return { original_url: input, canonical_url: url, access_status: 'unavailable', excerpt: error instanceof Error ? error.message : 'Fetch failed', publisher: new URL(url).hostname }; }
}
async function parseResponse(response: Response, url: string) {
  const type = response.headers.get('content-type') || ''; if (!response.ok || !type.includes('text/html')) return { original_url: url, canonical_url: url, access_status: 'unavailable', excerpt: `HTTP ${response.status} or unsupported content`, publisher: new URL(url).hostname };
  const text = (await response.text()).slice(0, 500000).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return { original_url: url, canonical_url: url, access_status: 'inspected', excerpt: text.slice(0, 1800), publisher: new URL(url).hostname, facts: ['Page text was fetched from the public URL.'], unknowns: ['Publication date and employer details require verification.'] };
}
export async function discover(sector: string, geography: string) {
  const query = encodeURIComponent(`${sector} ${geography} services hiring need`);
  try { const r = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, { signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'SignalFit discovery/1.0' } }); const html = await r.text(); const urls = [...html.matchAll(/result__a[^>]+href="([^"]+)/g)].map(m => m[1]).filter(x => /^https?:/i.test(x)); return [...new Set(urls)].slice(0, 12); } catch { return []; }
}
