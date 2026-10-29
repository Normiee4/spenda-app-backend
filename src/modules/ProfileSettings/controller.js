const asyncHandler = require('../../utils/asyncHandler');
const ProfileSettingsService = require('./service');

const get = asyncHandler(async (req, res) => {
  const settings = await ProfileSettingsService.get(req.user.id);
  res.status(200).json({ success: true, data: settings });
});

const update = asyncHandler(async (req, res) => {
  const settings = await ProfileSettingsService.update(req.user.id, req.body);
  res.status(200).json({ success: true, data: settings });
});

module.exports = { get, update };
