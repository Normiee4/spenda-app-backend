import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import app from '../../../app.js';

test('GET /api/v1/auth/me without a token returns 401', async () => {
  const res = await request(app).get('/api/v1/auth/me');

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('GET /api/v1/auth/me with a non-Bearer scheme returns 401', async () => {
  const res = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', 'Basic abc123');

  assert.equal(res.status, 401);
});

test('GET /api/v1/auth/me with an empty Bearer token returns 401', async () => {
  const res = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', 'Bearer ');

  assert.equal(res.status, 401);
});
