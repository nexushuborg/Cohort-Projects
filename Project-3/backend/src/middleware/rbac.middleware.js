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

module.exports = { rbacMiddleware };