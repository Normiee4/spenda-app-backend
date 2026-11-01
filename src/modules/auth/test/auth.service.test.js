import test from 'node:test';
import assert from 'node:assert/strict';

import { getMe } from '../auth.service.js';

test('returns the verified claims', () => {
  const result = getMe({
    auth: { sub: 'user-1', email: 'user@example.com', role: 'authenticated' },
  });

  assert.deepEqual(result, {
    id: 'user-1',
    email: 'user@example.com',
    role: 'authenticated',
  });
});

test('defaults the role to authenticated when the claim is missing', () => {
  const result = getMe({ auth: { sub: 'user-1', email: 'user@example.com' } });

  assert.equal(result.role, 'authenticated');
});
