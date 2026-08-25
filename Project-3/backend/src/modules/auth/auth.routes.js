const authRoute = require('express').Router();
const { createUser, loginUser, getUserDetails, refreshToken, resetPassword } = require('./auth.controller.js');
const { authMiddleware } = require('../../middleware/authMiddleware.js');

authRoute
    .post('/register', createUser)
    .post('/login', loginUser)
    .post('/refresh-token', refreshToken)
    .post('/password-reset', resetPassword)
    .get('/me', authMiddleware, getUserDetails);

module.exports = { authRoute };

