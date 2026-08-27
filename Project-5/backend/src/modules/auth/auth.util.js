const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const generateAccessToken = (user) => {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtAccessExpiry }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiry }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwtRefreshSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};