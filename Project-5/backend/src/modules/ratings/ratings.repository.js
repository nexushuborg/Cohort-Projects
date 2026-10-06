const db = require('../../config/database');

const findBookingById = async (bookingId, trx = db) => {
  return trx('ride_bookings')
    .where({ id: bookingId })
    .first();
};

const findRideById = async (rideId, trx = db) => {
  return trx('rides')
    .where({ id: rideId })
    .first();
};

const findDriverProfileById = async (driverProfileId, trx = db) => {
  return trx('driver_profiles')
    .where({ id: driverProfileId })
    .first();
};

const findDriverProfileByUserId = async (userId, trx = db) => {
  return trx('driver_profiles')
    .where({ user_id: userId })
    .first();
};

const findRatingByBookingAndUser = async (
  bookingId,
  fromUserId,
  trx = db
) => {
  return trx('ride_ratings')
    .where({
      booking_id: bookingId,
      from_user_id: fromUserId
    })
    .first();
};

const createRating = async (ratingData, trx = db) => {
  const rows = await trx('ride_ratings')
    .insert(ratingData)
    .returning('*');

  return rows[0];
};

const getRatingsForUser = async (userId, trx = db) => {
  return trx('ride_ratings as rr')
    .leftJoin('users as u', 'u.id', 'rr.from_user_id')
    .select(
      'rr.id',
      'rr.ride_id',
      'rr.booking_id',
      'rr.from_user_id',
      'rr.to_user_id',
      'rr.rating',
      'rr.text',
      'rr.created_at',
      'u.name as from_user_name',
      'u.avatar_url as from_user_avatar'
    )
    .where('rr.to_user_id', userId)
    .orderBy('rr.created_at', 'desc');
};

const getUserRatingSummary = async (userId, trx = db) => {
  const result = await trx('ride_ratings')
    .where({ to_user_id: userId })
    .avg('rating as average_rating')
    .count('id as total_ratings')
    .first();

  return {
    averageRating: result?.average_rating
      ? Number(result.average_rating)
      : 0,
    totalRatings: Number(result?.total_ratings || 0)
  };
};

const getRatingsForRide = async (rideId, trx = db) => {
  return trx('ride_ratings as rr')
    .leftJoin('users as u', 'u.id', 'rr.from_user_id')
    .select(
      'rr.id',
      'rr.ride_id',
      'rr.booking_id',
      'rr.from_user_id',
      'rr.to_user_id',
      'rr.rating',
      'rr.text',
      'rr.created_at',
      'u.name as from_user_name',
      'u.avatar_url as from_user_avatar'
    )
    .where('rr.ride_id', rideId)
    .orderBy('rr.created_at', 'asc');
};

const updateDriverAverageRating = async (
  driverProfileId,
  trx
) => {
    const driver = await trx('driver_profiles')
    .where({ id: driverProfileId })
    .forUpdate()
    .first();

  if (!driver) {
    return null;
  }

  const result = await trx('ride_ratings')
    .where({
      to_user_id: driver.user_id
    })
    .avg('rating as average_rating')
    .first();

  const averageRating = Number(
    result?.average_rating || 0
  );

  const rows = await trx('driver_profiles')
    .where({ id: driverProfileId })
    .update({
      avg_rating: averageRating,
      updated_at: trx.fn.now()
    })
    .returning('*');

  return rows[0];
};

module.exports = {
  findBookingById,
  findRideById,
  findDriverProfileById,
  findDriverProfileByUserId,
  findRatingByBookingAndUser,
  createRating,
  getRatingsForUser,
  getUserRatingSummary,
  getRatingsForRide,
  updateDriverAverageRating
};