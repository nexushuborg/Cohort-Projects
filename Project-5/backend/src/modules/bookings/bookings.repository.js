const db = require('../../config/database');

const createBooking = async (bookingData, trx = db) => {
  const [booking] = await trx('ride_bookings')
    .insert(bookingData)
    .returning('*');

  return booking;
};

const findBookingById = async (bookingId, trx = db) => {
  return trx('ride_bookings')
    .where({
      id: bookingId
    })
    .first();
};

const findBookingsByRider = async (riderId) => {
  return db('ride_bookings')
    .where({
      rider_id: riderId
    })
    .orderBy('created_at', 'desc');
};

const findRideById = async (rideId, trx = db) => {
  return trx('rides')
    .where({
      id: rideId
    })
    .first();
};

const updateBookingStatus = async (
  bookingId,
  status,
  trx = db
) => {
  const [booking] = await trx('ride_bookings')
    .where({
      id: bookingId
    })
    .update({
      status
    })
    .returning('*');

  return booking;
};

const decrementAvailableSeats = async (
  rideId,
  seats,
  trx
) => {
  const updated = await trx('rides')
    .where('id', rideId)
    .where('available_seats', '>=', seats)
    .decrement('available_seats', seats);

  return updated;
};

module.exports = {
  createBooking,
  findBookingById,
  findBookingsByRider,
  findRideById,
  updateBookingStatus,
  decrementAvailableSeats
};