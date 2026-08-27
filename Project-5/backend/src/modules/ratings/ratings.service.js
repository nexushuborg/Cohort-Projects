const db = require('../../config/database');

const ratingsRepository = require('./ratings.repository');

const createError = (message, status, code) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;

  return error;
};

const createRating = async ({
  bookingId,
  rating,
  text,
  userId
}) => {
  return db.transaction(async (trx) => {
    // --------------------------------------------------
    // 1. Find the booking
    // --------------------------------------------------

    const booking =
      await ratingsRepository.findBookingById(
        bookingId,
        trx
      );

    if (!booking) {
      throw createError(
        'Booking not found',
        404,
        'BOOKING_NOT_FOUND'
      );
    }

    // --------------------------------------------------
    // 2. Rating is only allowed after completion
    // --------------------------------------------------

    if (booking.status !== 'completed') {
      throw createError(
        'Ratings are only allowed after the trip is completed',
        400,
        'TRIP_NOT_COMPLETED'
      );
    }

    // --------------------------------------------------
    // 3. Find the ride
    // --------------------------------------------------

    const ride =
      await ratingsRepository.findRideById(
        booking.ride_id,
        trx
      );

    if (!ride) {
      throw createError(
        'Ride not found',
        404,
        'RIDE_NOT_FOUND'
      );
    }

    // --------------------------------------------------
    // 4. Find the driver
    // --------------------------------------------------

    const driverProfile =
      await ratingsRepository.findDriverProfileById(
        ride.driver_id,
        trx
      );

    if (!driverProfile) {
      throw createError(
        'Driver profile not found',
        404,
        'DRIVER_NOT_FOUND'
      );
    }

    // --------------------------------------------------
    // 5. Determine who is allowed to rate whom
    // --------------------------------------------------

    let toUserId;

    // Rider is rating the driver
    if (booking.rider_id === userId) {
      toUserId = driverProfile.user_id;
    }

    // Driver is rating the rider
    else if (driverProfile.user_id === userId) {
      toUserId = booking.rider_id;
    }

    // Someone unrelated to the booking
    else {
      throw createError(
        'You are not a participant in this trip',
        403,
        'RATING_NOT_ALLOWED'
      );
    }

    // --------------------------------------------------
    // 6. Prevent self-rating
    // --------------------------------------------------

    if (userId === toUserId) {
      throw createError(
        'You cannot rate yourself',
        400,
        'SELF_RATING_NOT_ALLOWED'
      );
    }

    // --------------------------------------------------
    // 7. Prevent duplicate rating
    // --------------------------------------------------

    const existingRating =
      await ratingsRepository.findRatingByBookingAndUser(
        bookingId,
        userId,
        trx
      );

    if (existingRating) {
      throw createError(
        'You have already rated this trip',
        409,
        'RATING_ALREADY_EXISTS'
      );
    }

    // --------------------------------------------------
    // 8. Create the rating
    // --------------------------------------------------

    const ratingData = {
      ride_id: booking.ride_id,
      booking_id: booking.id,
      from_user_id: userId,
      to_user_id: toUserId,
      rating,
      text: text || null
    };

    let createdRating;

    try {
      createdRating =
        await ratingsRepository.createRating(
          ratingData,
          trx
        );
    } catch (error) {
      // PostgreSQL unique constraint
      if (error.code === '23505') {
        throw createError(
          'You have already rated this trip',
          409,
          'RATING_ALREADY_EXISTS'
        );
      }

      throw error;
    }

    // --------------------------------------------------
    // 9. Update driver's cached average rating
    // --------------------------------------------------

    if (toUserId === driverProfile.user_id) {
      await ratingsRepository.updateDriverAverageRating(
        driverProfile.id,
        trx
      );
    }

    // --------------------------------------------------
    // 10. Return created rating
    // --------------------------------------------------

    return createdRating;
  });
};

const getRatingsForUser = async (userId) => {
  const [ratings, summary] = await Promise.all([
    ratingsRepository.getRatingsForUser(userId),
    ratingsRepository.getUserRatingSummary(userId)
  ]);

  return {
    userId,
    averageRating: Number(
      summary.averageRating.toFixed(2)
    ),
    totalRatings: summary.totalRatings,
    ratings
  };
};

const getRatingsForRide = async (rideId) => {
  const ride =
    await ratingsRepository.findRideById(rideId);

  if (!ride) {
    throw createError(
      'Ride not found',
      404,
      'RIDE_NOT_FOUND'
    );
  }

  const ratings =
    await ratingsRepository.getRatingsForRide(rideId);

  return {
    rideId,
    ratings
  };
};

module.exports = {
  createRating,
  getRatingsForUser,
  getRatingsForRide
};