import { URL } from 'node:url';
import dns from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';

const blocked = new BlockList();
for (const [addr, bits] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4]] as const) blocked.addSubnet(addr, bits, 'ipv4');
blocked.addAddress('::1', 'ipv6'); blocked.addAddress('::', 'ipv6'); blocked.addSubnet('fc00::', 7, 'ipv6'); blocked.addSubnet('fe80::', 10, 'ipv6');
const BLOCKED_HOST = /(^localhost$|\.local$|\.localhost$|\.internal$|^metadata\.)/i;
const TRACKING = /^(utm_.*|fbclid|gclid|ref|source|trk|mc_.*)$/i;
const MAX_BYTES = 500_000;

export function isPrivateIp(ip: string) {
  const family = isIP(ip); if (!family) return true;
  if (family === 6) { const mapped = ip.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); return mapped ? blocked.check(mapped[1], 'ipv4') : blocked.check(ip, 'ipv6'); }
  return blocked.check(ip, 'ipv4');
}
export function safeUrl(input: string) {
  const u = new URL(input);
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || (u.port && !['80', '443'].includes(u.port)) || BLOCKED_HOST.test(host) || (isIP(host) && isPrivateIp(host))) throw new Error('Only public HTTP(S) URLs are allowed.');
  return u;
}
export function canonical(input: string) {
  const u = safeUrl(input); u.hash = '';
  for (const key of [...u.searchParams.keys()]) if (TRACKING.test(key)) u.searchParams.delete(key);
  return u.toString().replace(/\/$/, '').replace(/\/\?/, '?');
}
async function assertPublic(url: string) {
  const host = new URL(url).hostname.replace(/^\[|\]$/g, '');
  const records = isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!records.length || records.some((r) => isPrivateIp(r.address))) throw new Error('Private or local destinations are blocked.');
}
async function readCapped(response: Response) {
  const reader = response.body?.getReader(); if (!reader) return '';
  const chunks: Uint8Array[] = []; let size = 0;
  while (size < MAX_BYTES) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); size += value.length; }
  await reader.cancel().catch(() => undefined);
  return Buffer.concat(chunks).toString('utf8').slice(0, MAX_BYTES);
}
/** Structured date hints only (JSON-LD datePosted / article meta); free-text dates are verified later against page text. */
export function structuredDate(html: string) {
  const m = html.match(/"datePosted"\s*:\s*"([^"]+)"/i) || html.match(/<meta[^>]+(?:article:published_time|og:published_time|datePublished)[^>]+content="([^"]+)"/i);
  const t = m ? Date.parse(m[1]) : NaN; return Number.isNaN(t) ? null : new Date(t).toISOString();
}
export function htmlToText(html: string) { return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&amp;|&#39;|&quot;/g, ' ').replace(/\s+/g, ' ').trim(); }

export type Inspected = { original_url: string; canonical_url: string; access_status: 'inspected' | 'unavailable'; excerpt: string; body_text?: string; publisher: string; published_at?: string | null; facts?: string[]; unknowns?: string[] };
export async function inspect(input: string): Promise<Inspected> {
  let url = ''; let target = '';
  try {
    url = canonical(input); target = safeUrl(input).toString();
    for (let hop = 0; hop < 4; hop++) {
      await assertPublic(target);
      const response = await fetch(target, { redirect: 'manual', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'SignalFit research reader/1.0', accept: 'text/html' } });
      if (response.status >= 300 && response.status < 400) { const location = response.headers.get('location'); if (!location) throw new Error('Redirect without destination'); target = safeUrl(new URL(location, target).toString()).toString(); url = canonical(target); continue; }
      const type = response.headers.get('content-type') || '';
      if (!response.ok || !type.includes('text/html')) return unavailable(input, url, `HTTP ${response.status} or unsupported content type`);
      const html = await readCapped(response); const text = htmlToText(html);
      if (text.length < 100) return unavailable(input, url, 'Page returned too little readable text (possibly script-rendered).');
      return { original_url: input, canonical_url: url, access_status: 'inspected', excerpt: text.slice(0, 1800), body_text: text.slice(0, 12000), publisher: new URL(url).hostname, published_at: structuredDate(html), facts: ['Page text was fetched from the public URL.'], unknowns: ['Employer details and buying intent require verification.'] };
    }
    throw new Error('Too many redirects');
  } catch (error) { return unavailable(input, url || input, error instanceof Error ? error.message : 'Fetch failed'); }
}
function unavailable(original: string, url: string, reason: string): Inspected {
  let publisher = ''; try { publisher = new URL(url).hostname; } catch { /* keep empty */ }
  return { original_url: original, canonical_url: url, access_status: 'unavailable', excerpt: reason, publisher };
}
export async function discover(sector: string, geography: string) {
  const query = encodeURIComponent(`${sector} ${geography} hiring careers jobs`);
  try {
    const r = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, { signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'Mozilla/5.0 SignalFit discovery/1.0' } });
    const html = await r.text();
    const urls = [...html.matchAll(/result__a[^>]+href="([^"]+)/g)].map((m) => { const href = m[1].replace(/&amp;/g, '&'); const wrapped = href.match(/[?&]uddg=([^&]+)/); return wrapped ? decodeURIComponent(wrapped[1]) : href; }).filter((x) => /^https?:/i.test(x));
    return [...new Set(urls)].slice(0, 12);
  } catch { return []; }
}
