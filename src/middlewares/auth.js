import { createRemoteJWKSet, jwtVerify } from 'jose';

import { supabaseJwksUrl, supabaseUrl } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { ensureUserFromClaims } from '../modules/Auth/model.js';

let jwks;

function getJwks() {
  if (!supabaseJwksUrl) {
    throw new Error('SUPABASE_URL or SUPABASE_JWKS_URL is not configured');
  }
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(supabaseJwksUrl));
  }
  return jwks;
}

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed authorization header'));
  }

  try {
    const issuer = supabaseUrl ? `${supabaseUrl}/auth/v1` : undefined;
    const { payload } = await jwtVerify(token, getJwks(), issuer ? { issuer } : {});

    if (!payload.sub) {
      return next(ApiError.unauthorized('Token is missing a subject'));
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    req.token = token;

    await ensureUserFromClaims(payload);

    return next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

export default { authenticate };
