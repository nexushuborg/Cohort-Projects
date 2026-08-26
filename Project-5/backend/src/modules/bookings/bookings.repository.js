const db = require('../../config/database');

const createBooking = async (bookingData) => {
  const [booking] = await db('ride_bookings')
    .insert(bookingData)
    .returning('*');

  return booking;
};

const findBookingById = async (bookingId) => {
  return db('ride_bookings')
    .where({ id: bookingId })
    .first();
};

const findBookingsByRider = async (riderId) => {
  return db('ride_bookings')
    .where({ rider_id: riderId })
    .orderBy('created_at', 'desc');
};

const findBookingsForDriverRides = async (driverId) => {
  return db('ride_bookings as rb')
    .join('rides as r', 'rb.ride_id', 'r.id')
    .where('r.driver_id', driverId)
    .orderBy('rb.created_at', 'desc');
};

const updateBooking = async (bookingId, updates) => {
  const [booking] = await db('ride_bookings')
    .where({ id: bookingId })
    .update({ ...updates, updated_at: db.fn.now() })
    .returning('*');

  return booking;
};

const findRideById = async (rideId) => {
  return db('rides')
    .where({ id: rideId })
    .first();
};

const decrementSeats = async (rideId, seats) => {
  await db('rides')
    .where({ id: rideId })
    .decrement('available_seats', seats);
};

const incrementSeats = async (rideId, seats) => {
  await db('rides')
    .where({ id: rideId })
    .increment('available_seats', seats);
};

const findDriverByUserId = async (userId) => {
  return db('driver_profiles')
    .where({ user_id: userId })
    .first();
};

const findWalletByDriverId = async (driverId) => {
  return db('wallet')
    .where({ driver_id: driverId })
    .first();
};

const createWalletTransaction = async (transactionData) => {
  const [transaction] = await db('wallet_transactions')
    .insert(transactionData)
    .returning('*');

  return transaction;
};

const updateWalletBalance = async (walletId, amount) => {
  const [wallet] = await db('wallet')
    .where({ id: walletId })
    .update({
      balance: db.raw('balance + ?', [amount]),
      updated_at: db.fn.now()
    })
    .returning('*');

  return wallet;
};

module.exports = {
  createBooking,
  findBookingById,
  findBookingsByRider,
  findBookingsForDriverRides,
  updateBooking,
  findRideById,
  decrementSeats,
  incrementSeats,
  findDriverByUserId,
  findWalletByDriverId,
  createWalletTransaction,
  updateWalletBalance
};
