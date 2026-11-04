const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const userRepository = require('../repositories/user.repository');

// Compared against when the user does not exist, to keep response timing uniform.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const toPublicUser = (u) => ({ id: u.id, username: u.username, fullName: u.full_name, role: u.role });

async function login({ username, password, rememberMe }) {
  const user = await userRepository.findByUsername(username);
  const matches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !matches) throw new AppError('Invalid username or password', 401);

  const token = jwt.sign({ sub: user.id, role: user.role, username: user.username }, env.JWT_SECRET, {
    expiresIn: rememberMe ? '7d' : env.JWT_EXPIRES_IN,
  });
  return { token, user: toPublicUser(user) };
}

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return toPublicUser(user);
}

module.exports = { login, getProfile };
