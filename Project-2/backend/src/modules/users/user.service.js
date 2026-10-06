const bcrypt = require('bcrypt');
const userRepo = require('./user.repository');
const {
  createNotFoundError,
  createUnauthorizedError,
} = require('../../utils/errors');

/**
 * User Service (Pure Business Logic Functions)
 */

async function getProfile(userId) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw createNotFoundError('User not found');
  }
  return user;
}

async function updateProfile(userId, profileData) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw createNotFoundError('User not found');
  }

  const allowedUpdates = {};
  if (profileData.name !== undefined) allowedUpdates.name = profileData.name;
  if (profileData.phone !== undefined) allowedUpdates.phone = profileData.phone;
  if (profileData.avatar_url !== undefined) allowedUpdates.avatar_url = profileData.avatar_url;

  const updatedUser = await userRepo.updateUser(userId, allowedUpdates);
  return updatedUser;
}

async function updatePassword(userId, currentPassword, newPassword) {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw createNotFoundError('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw createUnauthorizedError('Current password does not match');
  }

  const password_hash = await bcrypt.hash(newPassword, 10);
  await userRepo.updateUser(userId, { password_hash });

  return { message: 'Password updated successfully' };
}

async function listUsers(query) {
  const { page = 1, limit = 20, role = null } = query;
  return userRepo.findUsers({ page, limit, role });
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  listUsers,
};
