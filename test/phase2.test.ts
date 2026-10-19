import test from 'node:test'; import assert from 'node:assert/strict'; import { canonical } from '../lib/research'; import { qualifies, weightedFit } from '../lib/matching';
test('research canonicalization removes tracking query and fragment',()=>assert.equal(canonical('https://example.com/page/?utm_source=x#top'),'https://example.com/page'));
test('SSRF policy rejects loopback URLs',()=>assert.throws(()=>canonical('http://127.0.0.1/admin')));
test('recommendation eligibility requires two recent employers and context',()=>{assert.equal(qualifies(1,2,1),false);assert.equal(qualifies(2,2,1),true)});
test('fit score is deterministic and bounded',()=>{assert.equal(weightedFit({capabilities:5,pastWork:5,capacity:5,demand:5,market:5}),100);assert.equal(weightedFit({capabilities:0,pastWork:0,capacity:0,demand:0,market:0}),0)});
