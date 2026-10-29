import { db } from '../../config/db.js';

export async function findById(id) {
  return db.orm.public.User.where({ id }).first();
}

export async function findByUsername(username) {
  return db.orm.public.User.where({ username }).first();
}

export async function updateById(id, data) {
  return db.orm.public.User.where({ id }).update(data);
}

export async function ensureUserFromClaims(claims) {
  const id = claims?.sub;
  const email = claims?.email;

  if (!id || !email) return null;

  const meta = claims.user_metadata || {};
  const name = meta.full_name || meta.name || meta.display_name || null;
  const username = meta.username || meta.preferred_username || null;

  return db.orm.public.User.upsert({
    create: { id, email, name, username },
    update: {
      email,
      ...(name ? { name } : {}),
    },
  });
}
