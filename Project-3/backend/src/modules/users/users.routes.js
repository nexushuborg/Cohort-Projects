const userRoute = require('express').Router();
const { updateProfile, getPublicProfile } = require('./users.controller.js');
const { authMiddleware } = require('../../middleware/authMiddleware.js');

userRoute
    .put('/profile', authMiddleware, updateProfile)
    .get('/:id/public', getPublicProfile);

module.exports = { userRoute };
