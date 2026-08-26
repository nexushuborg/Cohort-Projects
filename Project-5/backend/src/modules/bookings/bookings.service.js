const repository = require('./bookings.repository');
const db = require('../../config/database');

const createBooking = async ({ userId, rideId, seatsBooked, message }) => {
  // Fetch ride
  const ride = await repository.findRideById(rideId);
  if (!ride) {
    const error = new Error('Ride not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (ride.status !== 'active') {
    const error = new Error('This ride is no longer available');
    error.statusCode = 400;
    error.code = 'RIDE_UNAVAILABLE';
    throw error;
  }

  if (ride.available_seats < seatsBooked) {
    const error = new Error(`Only ${ride.available_seats} seat(s) available`);
    error.statusCode = 400;
    error.code = 'SEATS_UNAVAILABLE';
    throw error;
  }

  // Prevent driver from booking their own ride
  const driver = await repository.findDriverByUserId(userId);
  if (driver && driver.id === ride.driver_id) {
    const error = new Error('You cannot book your own ride');
    error.statusCode = 400;
    error.code = 'OWN_RIDE';
    throw error;
  }

  const totalAmount = parseFloat(ride.price_per_seat) * seatsBooked;

  // Decrement available seats atomically
  await repository.decrementSeats(rideId, seatsBooked);

  // Create booking
  const booking = await repository.createBooking({
    ride_id: rideId,
    rider_id: userId,
    seats_booked: seatsBooked,
    total_amount: totalAmount,
    message: message || null,
    status: 'requested'
  });

  // Update ride status to 'full' if no seats left
  const updatedRide = await repository.findRideById(rideId);
  if (updatedRide && updatedRide.available_seats === 0) {
    await db('rides')
      .where({ id: rideId })
      .update({ status: 'full' });
  }

  return booking;
};

const getBookingById = async (bookingId) => {
  const booking = await repository.findBookingById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
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
  const booking = await repository.findBookingById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (booking.status !== 'requested') {
    const error = new Error('Booking is not in requested status');
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  // Verify the driver owns the ride
  const ride = await repository.findRideById(booking.ride_id);
  const driver = await repository.findDriverByUserId(driverUserId);
  if (!driver || !ride || ride.driver_id !== driver.id) {
    const error = new Error('Not authorized to accept this booking');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  return repository.updateBooking(bookingId, { status: 'accepted' });
};

const declineBooking = async (bookingId, driverUserId) => {
  const booking = await repository.findBookingById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (booking.status !== 'requested') {
    const error = new Error('Booking is not in requested status');
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  // Restore seats
  await repository.incrementSeats(booking.ride_id, booking.seats_booked);

  return repository.updateBooking(bookingId, { status: 'declined' });
};

const cancelBooking = async (bookingId, userId) => {
  const booking = await repository.findBookingById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (booking.status !== 'requested' && booking.status !== 'accepted') {
    const error = new Error('Booking cannot be cancelled in current status');
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  // Restore seats
  await repository.incrementSeats(booking.ride_id, booking.seats_booked);

  // If ride was 'full', revert to 'active'
  const ride = await repository.findRideById(booking.ride_id);
  if (ride && ride.status === 'full') {
    await db('rides')
      .where({ id: booking.ride_id })
      .update({ status: 'active' });
  }

  return repository.updateBooking(bookingId, { status: 'cancelled' });
};

const startTrip = async (bookingId, driverUserId) => {
  const booking = await repository.findBookingById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (booking.status !== 'accepted') {
    const error = new Error('Booking must be accepted before starting');
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  // Verify driver owns the ride
  const ride = await repository.findRideById(booking.ride_id);
  const driver = await repository.findDriverByUserId(driverUserId);
  if (!driver || !ride || ride.driver_id !== driver.id) {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  // Update ride status
  await db('rides')
    .where({ id: booking.ride_id })
    .update({ status: 'in_progress' });

  return repository.updateBooking(bookingId, { status: 'in_progress' });
};

const completeTrip = async (bookingId, driverUserId) => {
  const booking = await repository.findBookingById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (booking.status !== 'in_progress' && booking.status !== 'accepted') {
    const error = new Error('Booking cannot be completed in current status');
    error.statusCode = 400;
    error.code = 'INVALID_STATUS';
    throw error;
  }

  // Verify driver owns the ride
  const ride = await repository.findRideById(booking.ride_id);
  const driver = await repository.findDriverByUserId(driverUserId);
  if (!driver || !ride || ride.driver_id !== driver.id) {
    const error = new Error('Not authorized');
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  // Credit driver wallet
  const wallet = await repository.findWalletByDriverId(driver.id);
  if (wallet) {
    await repository.updateWalletBalance(wallet.id, booking.total_amount);
    await repository.createWalletTransaction({
      wallet_id: wallet.id,
      type: 'credit',
      amount: booking.total_amount,
      description: `Ride earning - ${ride.origin_city} to ${ride.destination_city}`,
      ride_id: ride.id
    });
  }

  // Mark ride as completed
  await db('rides')
    .where({ id: booking.ride_id })
    .update({ status: 'completed' });

  return repository.updateBooking(bookingId, { status: 'completed' });
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
