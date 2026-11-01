import test from 'node:test';
import assert from 'node:assert/strict';

import { createRequireAuth } from '../../../middlewares/auth-handler.js';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

function makeToken(payload) {
  return `${encode({ alg: 'ES256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

function makeReq(headers = {}) {
  return { headers };
}

function makeRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function makeNext() {
  const calls = [];
  const next = (...args) => calls.push(args);
  next.calls = calls;
  return next;
}

test('rejects a request with no Authorization header', async () => {
  let verified = false;
  const middleware = createRequireAuth(async () => {
    verified = true;
  });
  const res = makeRes();
  const next = makeNext();

  await middleware(makeReq(), res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(verified, false);
  assert.equal(next.calls.length, 0);
});

test('rejects a non-Bearer Authorization scheme', async () => {
  const middleware = createRequireAuth(async () => {
    throw new Error('should not be called');
  });
  const res = makeRes();
  const next = makeNext();

  await middleware(makeReq({ authorization: 'Basic abc123' }), res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(next.calls.length, 0);
});

test('rejects an empty Bearer token', async () => {
  const middleware = createRequireAuth(async () => {
    throw new Error('should not be called');
  });
  const res = makeRes();
  const next = makeNext();

  await middleware(makeReq({ authorization: 'Bearer    ' }), res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(next.calls.length, 0);
});

test('attaches the role-bound db and claims for a valid token', async () => {
  const token = makeToken({ sub: 'user-1', email: 'user@example.com', role: 'authenticated' });
  const fakeDb = { orm: { public: {} } };
  const seen = [];
  const middleware = createRequireAuth(async (received) => {
    seen.push(received);
    return fakeDb;
  });
  const req = makeReq({ authorization: `Bearer ${token}` });
  const res = makeRes();
  const next = makeNext();

  await middleware(req, res, next);

  assert.deepEqual(seen, [token]);
  assert.equal(req.db, fakeDb);
  assert.equal(req.auth.sub, 'user-1');
  assert.equal(req.auth.email, 'user@example.com');
  assert.equal(res.statusCode, 200);
  assert.deepEqual(next.calls, [[]]);
});

test('rejects an invalid token reported by the verifier', async () => {
  const middleware = createRequireAuth(async () => {
    const err = new Error('Invalid JWT');
    err.code = 'SUPABASE.JWT_INVALID';
    throw err;
  });
  const res = makeRes();
  const next = makeNext();

  await middleware(makeReq({ authorization: `Bearer ${makeToken({ sub: 'x' })}` }), res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(next.calls.length, 0);
});

test('forwards unexpected verifier errors to the error handler', async () => {
  const failure = new Error('connection refused');
  const middleware = createRequireAuth(async () => {
    throw failure;
  });
  const res = makeRes();
  const next = makeNext();

  await middleware(makeReq({ authorization: `Bearer ${makeToken({ sub: 'x' })}` }), res, next);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(next.calls, [[failure]]);
});
