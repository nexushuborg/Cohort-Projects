const express = require('express');

const controller = require('./drivers.controller');
const authenticateToken = require('../../middleware/auth.middleware');

const router = express.Router();

router.post(
  '/register',
  authenticateToken,
  controller.registerDriver
);

router.get(
  '/me',
  authenticateToken,
  controller.getMyDriverProfile
);

router.put(
  '/status',
  authenticateToken,
  controller.updateDriverStatus
);

router.get(
  '/:id/public',
  controller.getPublicDriver
);

module.exports = router;