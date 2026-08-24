const userService = require('./user.service');
const userView = require('./user.view');

/**
 * User Controller (Functional Request Handlers)
 */

async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.id);
    const data = userView.formatUser(user);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
    const data = userView.formatUser(updatedUser);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await userService.updatePassword(req.user.id, currentPassword, newPassword);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const { users, total } = await userService.listUsers(req.query);
    const items = userView.formatUserList(users);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  listUsers,
};
