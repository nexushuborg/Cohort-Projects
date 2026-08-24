const propertyRoute = require('express').Router();
const {
    createProperty, getProperties, getPropertyById, getHostProperties, updatePropertyStatus
} = require('./properties.controller.js');
const { authMiddleware, rbacMiddleware } = require('../../middleware/authMiddleware.js');

propertyRoute
    .post('/', authMiddleware, rbacMiddleware(['host', 'admin']), createProperty)
    .get('/', getProperties)
    .get('/my', authMiddleware, rbacMiddleware(['host', 'admin']), getHostProperties)
    .get('/:id', getPropertyById)
    .put('/:id/status', authMiddleware, rbacMiddleware(['host', 'admin']), updatePropertyStatus);

module.exports = { propertyRoute };