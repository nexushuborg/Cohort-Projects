const express = require('express');
const router = express.Router();
const walletController = require('./wallet.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { topUpSchema } = require('./wallet.validation');

// All wallet endpoints require authentication
router.use(authenticateToken);

router.get('/', walletController.getBalance);
router.post('/topup', validate(topUpSchema), walletController.topUp);
router.get('/transactions', walletController.getTransactionHistory);

module.exports = router;