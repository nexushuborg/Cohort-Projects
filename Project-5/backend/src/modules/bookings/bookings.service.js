const db = require('../../config/database');
const repository = require('./bookings.repository');

const createBooking = async (data) => {
  const ride = await repository.findRideById(data.rideId);

  if (!ride) {
    const error = new Error('Ride not found');
    error.statusCode = 404;
    error.code = 'RIDE_NOT_FOUND';
    throw error;
  }

  if (ride.status !== 'active') {
    const error = new Error('Ride is not available for booking');
    error.statusCode = 400;
    error.code = 'RIDE_NOT_AVAILABLE';
    throw error;
  }

  if (ride.driver_id === data.userId) {
    const error = new Error('Driver cannot book their own ride');
    error.statusCode = 403;
    error.code = 'DRIVER_CANNOT_BOOK';
    throw error;
  }

  if (data.seatsBooked > ride.available_seats) {
    const error = new Error('Not enough seats available');
    error.statusCode = 400;
    error.code = 'INSUFFICIENT_SEATS';
    throw error;
  }

  const totalAmount =
    Number(ride.price_per_seat) * data.seatsBooked;

  return repository.createBooking({
    ride_id: data.rideId,
    rider_id: data.userId,
    seats_booked: data.seatsBooked,
    total_amount: totalAmount,
    message: data.message || null,
    status: 'requested'
  });
};

const getBookingById = async (bookingId) => {
  const booking =
    await repository.findBookingById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'BOOKING_NOT_FOUND';
    throw error;
  }

  return booking;
};

const getMyBookings = async (userId) => {
  return repository.findBookingsByRider(userId);
};

const acceptBooking = async (bookingId, userId) => {
  return db.transaction(async (trx) => {
    const booking =
      await repository.findBookingById(bookingId, trx);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    const ride =
      await repository.findRideById(booking.ride_id, trx);

    if (!ride) {
      const error = new Error('Ride not found');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    if (String(ride.driver_id) !== String(userId)) {
      const error = new Error(
        'Only the driver can accept this booking'
      );
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (booking.status !== 'requested') {
      const error = new Error(
        'Only requested bookings can be accepted'
      );
      error.statusCode = 400;
      error.code = 'INVALID_BOOKING_STATUS';
      throw error;
    }

    const seatsUpdated =
      await repository.decrementAvailableSeats(
        booking.ride_id,
        booking.seats_booked,
        trx
      );

    if (seatsUpdated === 0) {
      const error = new Error('Not enough seats available');
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_SEATS';
      throw error;
    }

    return repository.updateBookingStatus(
      bookingId,
      'accepted',
      trx
    );
  });
};

const declineBooking = async (bookingId, userId) => {
  const booking =
    await repository.findBookingById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'BOOKING_NOT_FOUND';
    throw error;
  }

  const ride =
    await repository.findRideById(booking.ride_id);

  if (!ride) {
    const error = new Error('Ride not found');
    error.statusCode = 404;
    error.code = 'RIDE_NOT_FOUND';
    throw error;
  }

  if (String(ride.driver_id) !== String(userId)) {
    const error = new Error(
      'Only the driver can decline this booking'
    );
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (booking.status !== 'requested') {
    const error = new Error(
      'Only requested bookings can be declined'
    );
    error.statusCode = 400;
    error.code = 'INVALID_BOOKING_STATUS';
    throw error;
  }

  return repository.updateBookingStatus(
    bookingId,
    'declined'
  );
};

const cancelBooking = async (bookingId, userId) => {
  return db.transaction(async (trx) => {
    const booking =
      await repository.findBookingById(bookingId, trx);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    const ride =
      await repository.findRideById(booking.ride_id, trx);

    if (!ride) {
      const error = new Error('Ride not found');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const isRider =
      String(booking.rider_id) === String(userId);

    const isDriver =
      String(ride.driver_id) === String(userId);

    if (!isRider && !isDriver) {
      const error = new Error(
        'You are not allowed to cancel this booking'
      );
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (booking.status !== 'accepted') {
      const error = new Error(
        'Only accepted bookings can be cancelled'
      );
      error.statusCode = 400;
      error.code = 'INVALID_BOOKING_STATUS';
      throw error;
    }

    await trx('rides')
      .where('id', booking.ride_id)
      .increment('available_seats', booking.seats_booked);

    return repository.updateBookingStatus(
      bookingId,
      'cancelled',
      trx
    );
  });
};

const startTrip = async (bookingId, userId) => {
  const booking =
    await repository.findBookingById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'BOOKING_NOT_FOUND';
    throw error;
  }

  const ride =
    await repository.findRideById(booking.ride_id);

  if (!ride) {
    const error = new Error('Ride not found');
    error.statusCode = 404;
    error.code = 'RIDE_NOT_FOUND';
    throw error;
  }

  const isRider =
    String(booking.rider_id) === String(userId);

  const isDriver =
    String(ride.driver_id) === String(userId);

  if (!isRider && !isDriver) {
    const error = new Error(
      'You are not allowed to start this trip'
    );
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (booking.status !== 'accepted') {
    const error = new Error(
      'Only accepted bookings can start'
    );
    error.statusCode = 400;
    error.code = 'INVALID_BOOKING_STATUS';
    throw error;
  }

  return repository.updateBookingStatus(
    bookingId,
    'in_progress'
  );
};

const completeTrip = async (bookingId, userId) => {
  const booking =
    await repository.findBookingById(bookingId);

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'BOOKING_NOT_FOUND';
    throw error;
  }

  const ride =
    await repository.findRideById(booking.ride_id);

  if (!ride) {
    const error = new Error('Ride not found');
    error.statusCode = 404;
    error.code = 'RIDE_NOT_FOUND';
    throw error;
  }

  const isRider =
    String(booking.rider_id) === String(userId);

  const isDriver =
    String(ride.driver_id) === String(userId);

  if (!isRider && !isDriver) {
    const error = new Error(
      'You are not allowed to complete this trip'
    );
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (booking.status !== 'in_progress') {
    const error = new Error(
      'Only trips in progress can be completed'
    );
    error.statusCode = 400;
    error.code = 'INVALID_BOOKING_STATUS';
    throw error;
  }

  return repository.updateBookingStatus(
    bookingId,
    'completed'
  );
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