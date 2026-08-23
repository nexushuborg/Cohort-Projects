const service = require('./rides.service');
const { createRideSchema } = require('./rides.validation');

const createRide = async (req, res) => {
  try {
    const { error, value } = createRideSchema.validate(req.body);

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

    const ride = await service.createRide(value);

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
          error.statusCode === 400
            ? 'VALIDATION_ERROR'
            : 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

const getRideById = async (req, res) => {
  try {
    const ride = await service.getRideById(req.params.id);

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

module.exports = {
  createRide,
  getRideById
};