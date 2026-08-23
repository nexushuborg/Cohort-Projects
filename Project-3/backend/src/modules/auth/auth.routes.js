const authRoute = require('express').Router();
const { createUser, loginUser, getUserDetails } = require('./auth.controller.js');
const { authMiddleware } = require('../../middleware/authMiddleware.js');

authRoute
    .post('/register', createUser)
    .post('/login', loginUser)
    .get('/me', authMiddleware, getUserDetails);

module.exports = { authRoute };
