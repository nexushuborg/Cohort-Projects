const ratingsService = require('./ratings.service');

const createRating = async (req, res, next) => {
  try {
    const rating = await ratingsService.createRating({
      bookingId: req.body.bookingId,
      rating: req.body.rating,
      text: req.body.text,
      userId: req.user.sub
    });

    return res.status(201).json({
      success: true,
      data: rating
    });
  } catch (error) {
    next(error);
  }
};

const getRatingsForUser = async (req, res, next) => {
  try {
    const data =
      await ratingsService.getRatingsForUser(
        req.params.userId
      );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getRatingsForRide = async (req, res, next) => {
  try {
    const data =
      await ratingsService.getRatingsForRide(
        req.params.rideId
      );

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRating,
  getRatingsForUser,
  getRatingsForRide
};