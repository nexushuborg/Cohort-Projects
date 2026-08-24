const jwt = require('jsonwebtoken');
const { rbacMiddleware } = require('./rbac.middleware.js');

const authMiddleware = (req, res, next) => {
    const cookie = req.cookies?.token;
    const token = cookie || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'failed',
            message: 'Access denied, no token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'failed',
            message: 'Invalid or expired token.'
        });
    }
};

module.exports = { authMiddleware, rbacMiddleware };