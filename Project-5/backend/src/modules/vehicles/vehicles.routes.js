const express = require('express');

const controller = require('./vehicles.controller');
const authenticateToken = require('../../middleware/auth.middleware');

const router = express.Router();

router.post(
  '/',
  authenticateToken,
  controller.createVehicle
);

router.get(
  '/me',
  authenticateToken,
  controller.getMyVehicle
);

router.put(
  '/:id',
  authenticateToken,
  controller.updateVehicle
);

router.delete(
  '/:id',
  authenticateToken,
  controller.deleteVehicle
);

module.exports = router;