import { decodeJwt } from 'jose';

import { db } from '../../prisma/db.js';

// Materialise the public.user and public.profile rows for a Supabase user.
// Safe to call on every request: both statements are upserts keyed by the
// unique columns, and RLS only lets the caller insert/update their own row.
async function ensureUserAndProfile(userDb, { id, email }) {
  await userDb.orm.public.User.upsert({
    create: { id, email },
    update: { email },
  });

  await userDb.orm.public.Profile.upsert({
    create: { user_id: id },
    update: { user_id: id },
  });
}

// Returns the signed-in user's public rows. The token is verified by
// `asUser`; `decodeJwt` is only used to read the already-verified claims.
export async function getAuthenticatedUser(jwt) {
  const userDb = await db.asUser(jwt);
  const { sub: id, email } = decodeJwt(jwt);

  await ensureUserAndProfile(userDb, { id, email });

  const [user, profile] = await Promise.all([
    userDb.orm.public.User.where({ id }).first(),
    userDb.orm.public.Profile.where({ user_id: id }).first(),
  ]);

  return { user, profile };
}
