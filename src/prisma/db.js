import { contractFromJson } from '@prisma/orm-postgres/static';
import { supabase } from '@prisma/orm-extension-supabase/runtime';

import contractJson from './contract.json' with { type: 'json' };
import { databaseUrl, supabaseJwksUrl } from '../config/env.js';

if (!databaseUrl) {
  throw new Error(
    'DIRECT_URL is not set. Prisma 8 needs the session pooler (port 5432), not the transaction pooler.',
  );
}

if (!supabaseJwksUrl) {
  throw new Error('SUPABASE_URL is not set, so the Supabase JWKS URL could not be derived.');
}

// The emitted contract, validated once at startup.
export const contract = contractFromJson(contractJson);

// Role-first Supabase client. Bind a role per request before querying:
//   const userDb = await db.asUser(jwt);
//   await userDb.orm.public.User.where({ id }).first();
export const db = await supabase({
  contract,
  url: databaseUrl,
  jwksUrl: supabaseJwksUrl,
});
