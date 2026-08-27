const db = require('../../config/database');
const repository = require('./bookings.repository');

const createBooking = async ({ userId, rideId, seatsBooked, message }) => {
  const ride = await repository.findRideById(rideId);

  if (!ride) {
    const error = new Error('Ride not found');
    error.statusCode = 404;
    error.code = 'RIDE_NOT_FOUND';
    throw error;
  }

  if (ride.status !== 'active') {
    const error = new Error('This ride is no longer available for booking');
    error.statusCode = 400;
    error.code = 'RIDE_UNAVAILABLE';
    throw error;
  }

  if (ride.driver_id === userId) {
    const error = new Error('Driver cannot book their own ride');
    error.statusCode = 403;
    error.code = 'DRIVER_CANNOT_BOOK';
    throw error;
  }

  if (Number(seatsBooked) > Number(ride.available_seats)) {
    const error = new Error(`Only ${ride.available_seats} seat(s) available`);
    error.statusCode = 400;
    error.code = 'INSUFFICIENT_SEATS';
    throw error;
  }

  const totalAmount = Number(ride.price_per_seat) * Number(seatsBooked);

  return db.transaction(async (trx) => {
    const latestRide = await repository.findRideById(rideId, trx);

    if (!latestRide) {
      const error = new Error('Ride not found');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    if (latestRide.status !== 'active') {
      const error = new Error('This ride is no longer available for booking');
      error.statusCode = 400;
      error.code = 'RIDE_UNAVAILABLE';
      throw error;
    }

    if (Number(seatsBooked) > Number(latestRide.available_seats)) {
      const error = new Error(`Only ${latestRide.available_seats} seat(s) available`);
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_SEATS';
      throw error;
    }

    await repository.decrementSeats(rideId, seatsBooked, trx);

    const booking = await repository.createBooking(
      {
        ride_id: rideId,
        rider_id: userId,
        seats_booked: seatsBooked,
        total_amount: totalAmount,
        message: message || null,
        status: 'requested'
      },
      trx
    );

    const updatedRide = await repository.findRideById(rideId, trx);
    if (updatedRide && Number(updatedRide.available_seats) === 0) {
      await trx('rides').where({ id: rideId }).update({ status: 'full' });
    }

    return booking;
  });
};

const getBookingById = async (bookingId) => {
  const booking = await repository.findBookingById(bookingId);

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

const getDriverBookings = async (userId) => {
  const driver = await repository.findDriverByUserId(userId);

  if (!driver) {
    const error = new Error('Not registered as a driver');
    error.statusCode = 403;
    error.code = 'DRIVER_NOT_FOUND';
    throw error;
  }

  return repository.findBookingsForDriverRides(driver.id);
};

const acceptBooking = async (bookingId, driverUserId) => {
  return db.transaction(async (trx) => {
    const booking = await repository.findBookingById(bookingId, trx);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    if (booking.status !== 'requested') {
      const error = new Error('Booking is not in requested status');
      error.statusCode = 400;
      error.code = 'INVALID_BOOKING_STATUS';
      throw error;
    }

    const ride = await repository.findRideById(booking.ride_id, trx);
    if (!ride) {
      const error = new Error('Ride not found');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const driver = await repository.findDriverByUserId(driverUserId, trx);
    if (!driver || String(ride.driver_id) !== String(driver.id)) {
      const error = new Error('Not authorized to accept this booking');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (Number(ride.available_seats) < Number(booking.seats_booked)) {
      const error = new Error('Not enough seats available');
      error.statusCode = 400;
      error.code = 'INSUFFICIENT_SEATS';
      throw error;
    }

    await repository.decrementAvailableSeats(booking.ride_id, booking.seats_booked, trx);

    return repository.updateBookingStatus(bookingId, 'accepted', trx);
  });
};

const declineBooking = async (bookingId, driverUserId) => {
  return db.transaction(async (trx) => {
    const booking = await repository.findBookingById(bookingId, trx);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    if (booking.status !== 'requested') {
      const error = new Error('Booking is not in requested status');
      error.statusCode = 400;
      error.code = 'INVALID_BOOKING_STATUS';
      throw error;
    }

    const ride = await repository.findRideById(booking.ride_id, trx);
    if (!ride) {
      const error = new Error('Ride not found');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const driver = await repository.findDriverByUserId(driverUserId, trx);
    if (!driver || String(ride.driver_id) !== String(driver.id)) {
      const error = new Error('Not authorized to decline this booking');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return repository.updateBookingStatus(bookingId, 'declined', trx);
  });
};

const cancelBooking = async (bookingId, userId) => {
  return db.transaction(async (trx) => {
    const booking = await repository.findBookingById(bookingId, trx);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    const ride = await repository.findRideById(booking.ride_id, trx);
    if (!ride) {
      const error = new Error('Ride not found');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const isRider = String(booking.rider_id) === String(userId);
    const isDriver = String(ride.driver_id) === String(userId);

    if (!isRider && !isDriver) {
      const error = new Error('You are not allowed to cancel this booking');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (booking.status !== 'requested' && booking.status !== 'accepted') {
      const error = new Error('Booking cannot be cancelled in current status');
      error.statusCode = 400;
      error.code = 'INVALID_BOOKING_STATUS';
      throw error;
    }

    if (booking.status === 'accepted') {
      await trx('rides')
        .where({ id: booking.ride_id })
        .increment('available_seats', booking.seats_booked);

      if (ride.status === 'full') {
        await trx('rides').where({ id: booking.ride_id }).update({ status: 'active' });
      }
    }

    return repository.updateBookingStatus(bookingId, 'cancelled', trx);
  });
};

const startTrip = async (bookingId, driverUserId) => {
  return db.transaction(async (trx) => {
    const booking = await repository.findBookingById(bookingId, trx);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    if (booking.status !== 'accepted') {
      const error = new Error('Booking must be accepted before starting');
      error.statusCode = 400;
      error.code = 'INVALID_BOOKING_STATUS';
      throw error;
    }

    const ride = await repository.findRideById(booking.ride_id, trx);
    if (!ride) {
      const error = new Error('Ride not found');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const driver = await repository.findDriverByUserId(driverUserId, trx);
    if (!driver || String(ride.driver_id) !== String(driver.id)) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await trx('rides').where({ id: booking.ride_id }).update({ status: 'in_progress' });

    return repository.updateBookingStatus(bookingId, 'in_progress', trx);
  });
};

const completeTrip = async (bookingId, driverUserId) => {
  return db.transaction(async (trx) => {
    const booking = await repository.findBookingById(bookingId, trx);

    if (!booking) {
      const error = new Error('Booking not found');
      error.statusCode = 404;
      error.code = 'BOOKING_NOT_FOUND';
      throw error;
    }

    if (booking.status !== 'in_progress' && booking.status !== 'accepted') {
      const error = new Error('Booking cannot be completed in current status');
      error.statusCode = 400;
      error.code = 'INVALID_BOOKING_STATUS';
      throw error;
    }

    const ride = await repository.findRideById(booking.ride_id, trx);
    if (!ride) {
      const error = new Error('Ride not found');
      error.statusCode = 404;
      error.code = 'RIDE_NOT_FOUND';
      throw error;
    }

    const driver = await repository.findDriverByUserId(driverUserId, trx);
    if (!driver || String(ride.driver_id) !== String(driver.id)) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const wallet = await repository.findWalletByDriverId(driver.id, trx);
    if (wallet) {
      await repository.updateWalletBalance(wallet.id, booking.total_amount, trx);
      await repository.createWalletTransaction(
        {
          wallet_id: wallet.id,
          type: 'credit',
          amount: booking.total_amount,
          description: `Ride earning - ${ride.origin_city} to ${ride.destination_city}`,
          ride_id: ride.id
        },
        trx
      );
    }

    await trx('rides').where({ id: booking.ride_id }).update({ status: 'completed' });

    return repository.updateBookingStatus(bookingId, 'completed', trx);
  });
};

module.exports = {
  createBooking,
  getBookingById,
  getMyBookings,
  getDriverBookings,
  acceptBooking,
  declineBooking,
  cancelBooking,
  startTrip,
  completeTrip
};
