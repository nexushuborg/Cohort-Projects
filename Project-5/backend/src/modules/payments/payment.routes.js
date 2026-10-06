const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const authenticateToken = require('../../middleware/auth.middleware');

router.use(authenticateToken);

router.post('/process', paymentController.processPayment);
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;