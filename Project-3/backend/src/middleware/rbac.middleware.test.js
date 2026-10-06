const { rbacMiddleware } = require("./authMiddleware");

describe("RBAC Middleware Unit Tests", () => {
  it("should allow request if user role matches allowed roles", () => {
    const req = { user: { role: "admin" } };
    const res = {};
    const next = jest.fn();

    const middleware = rbacMiddleware(["host", "admin"]);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should reject request with 403 status if user role is forbidden", () => {
    const req = { user: { role: "guest" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    const middleware = rbacMiddleware(["host", "admin"]);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "failed" })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
