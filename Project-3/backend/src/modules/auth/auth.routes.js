const authRoute = require('express').Router();
const { createUser, loginUser, getUserDetails, refreshToken } = require('./auth.controller.js');
const { authMiddleware } = require('../../middleware/authMiddleware.js');

authRoute
    .post('/register', createUser)
    .post('/login', loginUser)
    .post('/refresh-token', refreshToken)
    .get('/me', authMiddleware, getUserDetails);

module.exports = { authRoute };
