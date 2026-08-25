const userRoute = require('express').Router();
const { updateProfile, getPublicProfile, getAllUsers } = require('./users.controller.js');
const { authMiddleware, rbacMiddleware } = require('../../middleware/authMiddleware.js');

userRoute
    .get('/', authMiddleware, rbacMiddleware(['admin']), getAllUsers)
    .put('/profile', authMiddleware, updateProfile)
    .get('/:id/public', getPublicProfile);

module.exports = { userRoute };

