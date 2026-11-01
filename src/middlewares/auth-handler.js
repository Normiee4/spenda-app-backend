import { decodeJwt } from 'jose';

const unauthorized = (res) =>
  res.status(401).json({ success: false, message: 'Unauthorized Access' });

// The verifier is injected so the middleware can be tested without a database
// or network. `verifyToken(token)` must resolve to a role-bound db and reject
// with a structured error when the token is invalid.
export function createRequireAuth(verifyToken) {
  return async function requireAuth(req, res, next) {
    const header = req.headers.authorization;

    // Both a Bearer scheme and a non-empty token are required.
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      return unauthorized(res);
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      return unauthorized(res);
    }

    try {
      req.db = await verifyToken(token);
      req.auth = decodeJwt(token);
      return next();
    } catch (err) {
      // Signature, expiry, and malformed-token failures all surface as this code.
      if (err?.code === 'SUPABASE.JWT_INVALID') {
        return unauthorized(res);
      }
      return next(err);
    }
  };
}

// Loaded lazily so importing the middleware (e.g. in tests) does not create the
// Supabase client or fetch the JWKS.
async function verifyWithSupabase(token) {
  const { db } = await import('../prisma/db.js');
  return db.asUser(token);
}

export const requireAuth = createRequireAuth(verifyWithSupabase);

export default requireAuth;
