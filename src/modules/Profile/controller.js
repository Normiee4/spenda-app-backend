import asyncHandler from '../../utils/asyncHandler.js';
import * as ProfileService from './service.js';

export const get = asyncHandler(async (req, res) => {
  const profile = await ProfileService.get(req.user.id);
  res.status(200).json({ success: true, data: profile });
});

export const update = asyncHandler(async (req, res) => {
  const profile = await ProfileService.update(req.user.id, req.body);
  res.status(200).json({ success: true, data: profile });
});

export default { get, update };
