import test from 'node:test'; import assert from 'node:assert/strict';
import { canonical, isPrivateIp, safeUrl } from '../lib/research';
import { eligibility, fitLabel, isRecent, scoreDimensions, validateCitations, type EvidenceRec } from '../lib/validator';

const now = new Date('2026-10-22T00:00:00Z');
const ev = (id: string, o: Partial<EvidenceRec> = {}): EvidenceRec => ({ id, runId: 'r1', employer: id, publisher: id, pageType: 'job_posting', publishedAt: '2026-10-10T00:00:00Z', accessStatus: 'inspected', ...o });

test('SSRF: private, metadata, mapped and IPv6 ranges are blocked', () => {
  for (const u of ['http://127.0.0.1/', 'http://10.1.2.3/', 'http://172.16.0.1/', 'http://192.168.1.1/', 'http://169.254.169.254/latest', 'http://100.64.0.1/', 'http://[::1]/', 'http://[::ffff:127.0.0.1]/', 'http://[fd00::1]/', 'http://localhost/', 'http://metadata.google.internal/', 'ftp://example.com/', 'https://user:pw@example.com/', 'http://example.com:8080/'])
    assert.throws(() => safeUrl(u), u);
  assert.equal(isPrivateIp('8.8.8.8'), false); assert.equal(isPrivateIp('172.32.0.1'), false);
});
test('canonical drops tracking params but keeps job ids', () => {
  assert.equal(canonical('https://example.com/jobs/?utm_source=x&gh_jid=42#top'), 'https://example.com/jobs?gh_jid=42');
});
test('citations: nonexistent, cross-run and uninspected ids are rejected', () => {
  const index = new Map([['a', ev('a')], ['b', ev('b', { runId: 'other' })], ['c', ev('c', { accessStatus: 'unavailable' })]]);
  const out = validateCitations(['a', 'b', 'c', 'ghost', 'a'], index, 'r1');
  assert.deepEqual(out.valid, ['a']); assert.deepEqual(out.rejected, ['b', 'c', 'ghost']);
});
test('recency: undated and stale sources cannot establish recency', () => {
  assert.equal(isRecent(null, now), false); assert.equal(isRecent('2026-08-01T00:00:00Z', now), false); assert.equal(isRecent('2026-10-10T00:00:00Z', now), true);
});
test('eligibility: needs two dated employers plus context page; one employer is a lead', () => {
  const a = ev('A'), b = ev('B'), ctx = ev('C', { pageType: 'company_context' });
  assert.equal(eligibility([a, b], [a, b, ctx], now), 'recommended');
  assert.equal(eligibility([a, b], [a, b], now), 'discovery_lead');
  assert.equal(eligibility([a, ev('A2', { employer: 'A' })], [a, ctx], now), 'discovery_lead');
  assert.equal(eligibility([a, ev('B', { publishedAt: null })], [a, ctx], now), 'discovery_lead');
  assert.equal(eligibility([], [ctx], now), 'insufficient_evidence');
});
test('score: unknown dimension blocks strong label; conflicts force conditional', () => {
  const d = (s: number | null) => ({ score: s, evidenceIds: [], note: '' });
  const full = scoreDimensions({ capabilities: d(5), pastWork: d(5), capacity: d(5), demand: d(5), market: d(5) });
  assert.equal(full.total, 100); assert.equal(fitLabel(full.total, full.unknown, []), 'strong');
  const partial = scoreDimensions({ capabilities: d(5), pastWork: d(5), capacity: d(5), demand: d(5), market: d(null) });
  assert.deepEqual(partial.unknown, ['market']); assert.notEqual(fitLabel(partial.total, partial.unknown, []), 'strong');
  assert.equal(fitLabel(100, [], ['on-site required']), 'conditional');
});
