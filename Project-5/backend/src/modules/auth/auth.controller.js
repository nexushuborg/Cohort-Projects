const bcrypt = require('bcrypt');
const authRepo = require('./auth.repository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('./auth.util');

const register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    const existingUser = await authRepo.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'User with this email already exists' }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepo.createUser({
      email,
      password_hash: passwordHash,
      name,
      phone: phone || null
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' }
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' }
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatar_url
    };

    const accessToken = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);

    res.status(200).json({
      success: true,
      data: {
        user: safeUser,
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    const decoded = verifyRefreshToken(token);
    const user = await authRepo.findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not found' }
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (err) {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Invalid or expired refresh token' }
    });
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authRepo.findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User profile not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
};