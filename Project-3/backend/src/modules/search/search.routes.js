const searchRoute = require('express').Router();
const { searchProperties } = require('./search.controller.js');

searchRoute.get('/', searchProperties);

module.exports = { searchRoute };