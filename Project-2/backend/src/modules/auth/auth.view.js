/**
 * Auth View (Serialization & Response Presentation)
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

function formatAuthResponse({ user, accessToken, refreshToken }) {
  const payload = {
    user: formatUser(user),
  };

  if (accessToken) {
    payload.accessToken = accessToken;
  }

  if (refreshToken) {
    payload.refreshToken = refreshToken;
  }

  return payload;
}

module.exports = {
  formatUser,
  formatAuthResponse,
};
