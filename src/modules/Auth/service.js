const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const AuthModel = require('./model');

const SALT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role || 'user' },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function register({ email, password, name }) {
  const existing = await AuthModel.findByEmail(email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await AuthModel.create({ email, passwordHash, name });

  return { user, token: signToken(user) };
}

async function login({ email, password }) {
  const user = await AuthModel.findByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return { user: safeUser, token: signToken(safeUser) };
}

async function getProfile(userId) {
  const user = await AuthModel.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await AuthModel.findByIdWithPassword(userId);
  if (!user) throw ApiError.notFound('User not found');

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  return AuthModel.updatePassword(userId, passwordHash);
}

module.exports = { register, login, getProfile, changePassword };
