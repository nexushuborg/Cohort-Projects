const calendarRoute = require('express').Router();
const { getPropertyCalendar, blockDates, unblockDates } = require('./calendar.controller.js');
const { authMiddleware, rbacMiddleware } = require('../../middleware/authMiddleware.js');

calendarRoute
    .get('/:propertyId', getPropertyCalendar)
    .post('/:propertyId/block', authMiddleware, rbacMiddleware(['host', 'admin']), blockDates)
    .delete('/blocks/:blockId', authMiddleware, rbacMiddleware(['host', 'admin']), unblockDates);

module.exports = { calendarRoute };