const db = require('../../config/database');

const findRideById = async (rideId, trx = db) => {
  return trx('rides').where({ id: rideId }).first();
};

const findDriverByUserId = async (userId, trx = db) => {
  return trx('driver_profiles').where({ user_id: userId }).first();
};

const findBookingById = async (bookingId, trx = db) => {
  return trx('ride_bookings').where({ id: bookingId }).first();
};

const createBooking = async (bookingData, trx = db) => {
  const [booking] = await trx('ride_bookings')
    .insert(bookingData)
    .returning('*');

  return booking;
};

const updateBookingStatus = async (bookingId, status, trx = db) => {
  const [booking] = await trx('ride_bookings')
    .where({ id: bookingId })
    .update({ status, updated_at: trx.fn.now() })
    .returning('*');

  return booking;
};

const updateBooking = async (bookingId, updates, trx = db) => {
  const [booking] = await trx('ride_bookings')
    .where({ id: bookingId })
    .update({ ...updates, updated_at: trx.fn.now() })
    .returning('*');

  return booking;
};

const findBookingsByRider = async (userId, trx = db) => {
  return trx('ride_bookings as rb')
    .join('rides as r', 'rb.ride_id', 'r.id')
    .select(
      'rb.*',
      'r.origin_city',
      'r.destination_city',
      'r.departure_at',
      'r.driver_id'
    )
    .where('rb.rider_id', userId)
    .orderBy('rb.created_at', 'desc');
};

const findBookingsForDriverRides = async (driverId, trx = db) => {
  return trx('ride_bookings as rb')
    .join('rides as r', 'rb.ride_id', 'r.id')
    .select(
      'rb.*',
      'r.origin_city',
      'r.destination_city',
      'r.departure_at',
      'r.driver_id'
    )
    .where('r.driver_id', driverId)
    .orderBy('rb.created_at', 'desc');
};

const decrementSeats = async (rideId, seatsBooked, trx = db) => {
  const [ride] = await trx('rides')
    .where({ id: rideId })
    .decrement('available_seats', seatsBooked)
    .returning('*');

  return ride;
};

const incrementSeats = async (rideId, seatsBooked, trx = db) => {
  const [ride] = await trx('rides')
    .where({ id: rideId })
    .increment('available_seats', seatsBooked)
    .returning('*');

  return ride;
};

const decrementAvailableSeats = async (rideId, seatsBooked, trx = db) => {
  const [ride] = await trx('rides')
    .where({ id: rideId })
    .decrement('available_seats', seatsBooked)
    .returning(['available_seats']);

  return ride ? Number(ride.available_seats) : 0;
};

const findWalletByDriverId = async (driverId, trx = db) => {
  return trx('wallet').where({ driver_id: driverId }).first();
};

const updateWalletBalance = async (walletId, amount, trx = db) => {
  const [wallet] = await trx('wallet')
    .where({ id: walletId })
    .update({
      balance: trx.raw('?? + ?', ['balance', amount]),
      updated_at: trx.fn.now()
    })
    .returning('*');

  return wallet;
};

const createWalletTransaction = async (transactionData, trx = db) => {
  const [transaction] = await trx('wallet_transactions')
    .insert(transactionData)
    .returning('*');

  return transaction;
};

module.exports = {
  findRideById,
  findDriverByUserId,
  findBookingById,
  createBooking,
  updateBookingStatus,
  updateBooking,
  findBookingsByRider,
  findBookingsForDriverRides,
  decrementSeats,
  incrementSeats,
  decrementAvailableSeats,
  findWalletByDriverId,
  updateWalletBalance,
  createWalletTransaction
};
