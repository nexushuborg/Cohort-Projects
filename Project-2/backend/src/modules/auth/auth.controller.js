const authService = require('./auth.service');
const authView = require('./auth.view');

/**
 * Auth Controller (Functional Request Handlers)
 */

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    const data = authView.formatAuthResponse(result);
    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    const data = authView.formatAuthResponse(result);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken: token } = req.body;
    const result = await authService.refreshTokens(token);
    const data = authView.formatAuthResponse(result);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        message: 'Successfully logged out',
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    const data = authView.formatUser(user);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
};
