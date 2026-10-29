const asyncHandler = require('../../utils/asyncHandler');
const AuthService = require('./service');

const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);
  res.status(200).json({ success: true, data: result });
});

const me = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: user });
});

const changePassword = asyncHandler(async (req, res) => {
  await AuthService.changePassword(req.user.id, req.body);
  res.status(200).json({ success: true, message: 'Password updated' });
});

module.exports = { register, login, me, changePassword };
