const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const authMiddleware = (req, res, next) => {
    const cookie = req.cookies.token;
    const token = cookie || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'failed',
            message: 'Access denied, no token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'failed',
            message: 'Invalid or expired token.'
        });
    }
};

const rbacMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'failed',
                message: `Access denied. Only ${allowedRoles.join(" or ")} can perform this action.`
            });
        }
        next();
    };
};

module.exports = { authMiddleware, rbacMiddleware };