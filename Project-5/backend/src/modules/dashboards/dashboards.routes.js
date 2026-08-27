const express = require('express');
const controller = require('./dashboards.controller');
const authenticateToken = require('../../middleware/auth.middleware');

const router = express.Router();

router.get('/driver', authenticateToken, controller.getDriverDashboard);
router.get('/rider', authenticateToken, controller.getRiderDashboard);
router.get('/admin', authenticateToken, controller.getAdminDashboard);

module.exports = router;