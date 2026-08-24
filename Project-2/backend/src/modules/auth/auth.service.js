const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../../config/env');
const authRepo = require('./auth.repository');
const {
  createConflictError,
  createUnauthorizedError,
  createNotFoundError,
} = require('../../utils/errors');

// Hash token before bcrypt to safely handle JWTs longer than 72 bytes
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      jti: uuidv4(),
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRY }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      type: 'refresh',
      jti: uuidv4(),
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRY }
  );
}

async function register(userData) {
  const existing = await authRepo.findUserByEmail(userData.email);
  if (existing) {
    throw createConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(userData.password, 10);

  const user = await authRepo.createUser({
    ...userData,
    password_hash: passwordHash,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token in database for session tracking & rotation
  const refreshTokenHash = await bcrypt.hash(hashToken(refreshToken), 10);
  await authRepo.updateUserRefreshToken(user.id, refreshTokenHash);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

async function login(email, password) {
  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    throw createUnauthorizedError('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw createUnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshTokenHash = await bcrypt.hash(hashToken(refreshToken), 10);
  await authRepo.updateUserRefreshToken(user.id, refreshTokenHash);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

async function refreshTokens(rawRefreshToken) {
  let decoded;
  try {
    decoded = jwt.verify(rawRefreshToken, env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw createUnauthorizedError('Invalid or expired refresh token');
  }

  if (decoded.type !== 'refresh' || !decoded.sub) {
    throw createUnauthorizedError('Invalid token payload');
  }

  const user = await authRepo.findUserById(decoded.sub);
  if (!user || !user.refresh_token_hash) {
    throw createUnauthorizedError('Session has expired. Please log in again.');
  }

  const isValid = await bcrypt.compare(hashToken(rawRefreshToken), user.refresh_token_hash);
  if (!isValid) {
    // If old/tampered token used, invalidate all sessions to protect user
    await authRepo.clearUserRefreshToken(user.id);
    throw createUnauthorizedError('Token reuse detected. Please log in again.');
  }

  // Issue rotated token pair
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const refreshTokenHash = await bcrypt.hash(hashToken(refreshToken), 10);
  await authRepo.updateUserRefreshToken(user.id, refreshTokenHash);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

async function logout(userId) {
  await authRepo.clearUserRefreshToken(userId);
  return { message: 'Logged out successfully' };
}

async function getMe(userId) {
  const user = await authRepo.findUserById(userId);
  if (!user) {
    throw createNotFoundError('User not found');
  }
  return user;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  register,
  login,
  refreshTokens,
  logout,
  getMe,
};
