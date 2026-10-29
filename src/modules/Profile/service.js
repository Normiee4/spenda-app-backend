import ApiError from '../../utils/ApiError.js';
import * as ProfileModel from './model.js';

export async function get(userId) {
  const profile = await ProfileModel.findByUserId(userId);
  if (profile) return profile;
  return ProfileModel.createDefault(userId);
}

export async function update(userId, data) {
  await get(userId);
  const updated = await ProfileModel.update(userId, data);
  if (!updated) throw ApiError.notFound('Profile not found');
  return updated;
}

export default { get, update };
