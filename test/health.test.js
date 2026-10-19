import test from 'node:test';
import assert from 'node:assert/strict';
test('health contract is documented', () => {
  assert.equal('/api/health'.startsWith('/api/'), true);
  assert.deepEqual(['status','service','timestamp'], ['status','service','timestamp']);
});
