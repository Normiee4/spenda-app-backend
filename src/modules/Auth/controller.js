import asyncHandler from '../../utils/asyncHandler.js';
import * as AuthService from './service.js';

export const me = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await AuthService.updateProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: user });
});

export default { me, updateMe };
