import ApiError from '../../utils/ApiError.js';
import * as AuthModel from './model.js';

export async function getProfile(userId) {
  const user = await AuthModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function updateProfile(userId, data) {
  const patch = {};

  if (data.username !== undefined) {
    const existing = await AuthModel.findByUsername(data.username);
    if (existing && existing.id !== userId) {
      throw ApiError.conflict('That username is already taken');
    }
    patch.username = data.username;
  }

  if (data.name !== undefined) {
    patch.name = data.name;
  }

  if (Object.keys(patch).length === 0) {
    return getProfile(userId);
  }

  const updated = await AuthModel.updateById(userId, patch);
  if (!updated) throw ApiError.notFound('User not found');
  return updated;
}

export default { getProfile, updateProfile };
