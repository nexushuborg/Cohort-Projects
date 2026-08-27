const jwt = require("jsonwebtoken");
const { authMiddleware } = require("./authMiddleware");

describe("Auth Middleware Unit Tests", () => {
  it("should reject request when no authorization header is provided", () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach user payload to req when valid JWT is provided", () => {
    const secret = process.env.JWT_SECRET || "secret";
    const token = jwt.sign(
      { id: "user-123", email: "guest@test.com", role: "guest" },
      secret
    );

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.email).toBe("guest@test.com");
    expect(next).toHaveBeenCalled();
  });
});
