/**
 * User View (Serialization)
 */

function formatUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone || null,
    avatarUrl: user.avatar_url || null,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

function formatUserList(users) {
  return users.map(formatUser);
}

module.exports = {
  formatUser,
  formatUserList,
};
