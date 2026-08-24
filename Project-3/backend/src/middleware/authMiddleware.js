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



module.exports = { authMiddleware};