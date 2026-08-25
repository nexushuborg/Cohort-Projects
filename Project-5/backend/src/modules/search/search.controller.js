const searchRepo = require('./search.repository');

const searchRides = async (req, res, next) => {
  try {
    const results = await searchRepo.searchRides(req.query);
    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchRides
};