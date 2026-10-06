const express = require('express');
const controller = require('./search.controller');
const validate = require('../../middleware/validate.middleware');
const { searchRidesQuerySchema } = require('./search.validation');

const router = express.Router();

router.get('/', validate(searchRidesQuerySchema, 'query'), controller.searchRides);

module.exports = router;