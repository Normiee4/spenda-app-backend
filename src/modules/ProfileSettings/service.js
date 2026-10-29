const ProfileSettingsModel = require('./model');

async function get(userId) {
  const settings = await ProfileSettingsModel.findByUserId(userId);
  if (settings) return settings;
  return ProfileSettingsModel.createDefault(userId);
}

async function update(userId, data) {
  await get(userId);
  return ProfileSettingsModel.update(userId, data);
}

module.exports = { get, update };
