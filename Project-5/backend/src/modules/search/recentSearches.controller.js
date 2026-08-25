const searchRepo = require('./search.repository');

const getRecentSearches = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.sub;
    const searches = await searchRepo.getRecentSearchesByUserId(userId);

    return res.status(200).json({
      success: true,
      data: searches
    });
  } catch (error) {
    next(error);
  }
};

const saveRecentSearch = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.sub;
    const search = await searchRepo.saveRecentSearch(userId, req.body);

    return res.status(201).json({
      success: true,
      data: search
    });
  } catch (error) {
    next(error);
  }
};

const deleteRecentSearch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId || req.user.sub;

    await searchRepo.deleteRecentSearch(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Recent search removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecentSearches,
  saveRecentSearch,
  deleteRecentSearch
};