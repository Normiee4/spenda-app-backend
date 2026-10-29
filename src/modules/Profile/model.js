import { db } from '../../config/db.js';

export async function findByUserId(userId) {
  return db.orm.public.Profile.where({ user_id: userId }).first();
}

export async function createDefault(userId) {
  return db.orm.public.Profile.upsert({
    create: { user_id: userId },
    update: {},
  });
}

export async function update(userId, data) {
  const patch = {};

  if (data.displayName !== undefined) patch.display_name = data.displayName;
  if (data.avatarUrl !== undefined) patch.avatar_url = data.avatarUrl;
  if (data.isDarkmode !== undefined) patch.is_darkmode = data.isDarkmode;
  if (data.allowNotifications !== undefined) patch.allow_notifications = data.allowNotifications;

  if (Object.keys(patch).length === 0) return findByUserId(userId);

  return db.orm.public.Profile.where({ user_id: userId }).update(patch);
}

export default { findByUserId, createDefault, update };
