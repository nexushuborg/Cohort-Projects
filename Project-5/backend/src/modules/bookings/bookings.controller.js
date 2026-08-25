const {
  createBookingSchema
} = require('./bookings.validation');
const service = require('./bookings.service');

const createBooking = async (req, res) => {
  try {
    const { error, value } =
      createBookingSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid booking data',
          details: error.details.map((detail) => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }

    const booking = await service.createBooking({
      userId: req.user.sub,
      ...value
    });

    return res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking =
      await service.getBookingById(req.params.id);

    return res.status(200).json({
      success: true,
      data: booking
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

const getMyBookings = async (req, res) => {
  try {
    const bookings =
      await service.getMyBookings(req.user.sub);

    return res.status(200).json({
      success: true,
      data: bookings
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

const acceptBooking = async (req, res) => {
  try {
    const booking =
      await service.acceptBooking(
        req.params.id,
        req.user.sub
      );

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

const declineBooking = async (req, res) => {
  try {
    const booking =
      await service.declineBooking(
        req.params.id,
        req.user.sub
      );

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking =
      await service.cancelBooking(
        req.params.id,
        req.user.sub
      );

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

const startTrip = async (req, res) => {
  try {
    const booking =
      await service.startTrip(
        req.params.id,
        req.user.sub
      );

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

const completeTrip = async (req, res) => {
  try {
    const booking =
      await service.completeTrip(
        req.params.id,
        req.user.sub
      );

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getMyBookings,
  acceptBooking,
  declineBooking,
  cancelBooking,
  startTrip,
  completeTrip
};