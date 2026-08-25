const jwt = require("jsonwebtoken");

const generateTestToken = (user = {}) => {
  const payload = {
    id: user.id || "test-user-id",
    email: user.email || "test@example.com",
    role: user.role || "guest",
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "test-jwt-secret", {
    expiresIn: "1h",
  });
};

module.exports = {
  generateTestToken,
};
