const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const { registerSchema, loginSchema, refreshTokenSchema } = require('./auth.validation');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;