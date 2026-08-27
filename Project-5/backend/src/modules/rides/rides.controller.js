const service = require('./rides.service');
const { createRideSchema } = require('./rides.validation');

const createRide = async (req, res) => {
  try {
    const { error, value } =
      createRideSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid ride data',
          details: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    const ride = await service.createRide({
      userId: req.user.sub,
      ...value
    });

    return res.status(201).json({
      success: true,
      data: {
        id: ride.id,
        status: ride.status,
        availableSeats: ride.available_seats
      }
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code:
          error.code ||
          (error.statusCode === 400
            ? 'VALIDATION_ERROR'
            : error.statusCode === 403
              ? 'FORBIDDEN'
              : 'INTERNAL_ERROR'),

        message: error.message
      }
    });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride =
      await service.getRideById(req.params.id);

    return res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code:
          error.statusCode === 404
            ? 'NOT_FOUND'
            : 'INTERNAL_ERROR',

        message: error.message
      }
    });
  }
};

const getMyRides = async (req, res) => {
  try {
    const rides = await service.getMyRides(req.user.sub);
    return res.status(200).json({
      success: true,
      data: rides
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

const startRide = async (req, res) => {
  try {
    const ride = await service.startRide(req.params.id, req.user.sub);
    return res.status(200).json({ success: true, data: ride });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message }
    });
  }
};

const cancelRide = async (req, res) => {
  try {
    const ride = await service.cancelRide(req.params.id, req.user.sub);
    return res.status(200).json({ success: true, data: ride });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { code: error.code || 'INTERNAL_ERROR', message: error.message }
    });
  }
};

module.exports = {
  createRide,
  getRideById,
  getMyRides,
  startRide,
  cancelRide
};