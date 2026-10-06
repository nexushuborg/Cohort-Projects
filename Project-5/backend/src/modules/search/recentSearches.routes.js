const express = require('express');
const controller = require('./recentSearches.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { createRecentSearchSchema } = require('./recentSearches.validation');

const router = express.Router();

router.get('/me', authenticateToken, controller.getRecentSearches);
router.post('/', authenticateToken, validate(createRecentSearchSchema), controller.saveRecentSearch);
router.delete('/:id', authenticateToken, controller.deleteRecentSearch);

module.exports = router;