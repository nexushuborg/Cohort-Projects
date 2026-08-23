const db = require('../../config/database');

/**
 * Searches rides with dynamic filters and sorting options.
 */
const searchRides = async ({ origin, destination, date, seats = 1, sortBy = 'departure_at', order = 'asc', page = 1, limit = 20 }) => {
  // Base filtering query used for both counting and fetching
  const baseQuery = db('rides as r')
    .where('r.status', 'active')
    .andWhere('r.available_seats', '>=', seats);

  if (origin) {
    baseQuery.whereILike('r.origin_city', `%${origin}%`);
  }

  if (destination) {
    baseQuery.whereILike('r.destination_city', `%${destination}%`);
  }

  if (date) {
    baseQuery.whereRaw('DATE(r.departure_at) = DATE(?)', [date]);
  }

  // 1. Get total count cleanly without joins
  const [{ count }] = await baseQuery.clone().count('r.id as count');

  // 2. Build full data retrieval query with joins
  const allowedSortFields = ['price_per_seat', 'departure_at'];
  const sortColumn = allowedSortFields.includes(sortBy) ? `r.${sortBy}` : 'r.departure_at';
  const sortOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc';
  const offset = (page - 1) * limit;

  const items = await baseQuery
    .join('driver_profiles as dp', 'r.driver_id', 'dp.id')
    .join('users as u', 'dp.user_id', 'u.id')
    .join('vehicles as v', 'r.vehicle_id', 'v.id')
    .select(
      'r.*',
      'u.name as driver_name',
      'u.avatar_url as driver_avatar',
      'dp.avg_rating as driver_rating',
      'dp.total_trips as driver_trips',
      'v.make as vehicle_make',
      'v.model as vehicle_model',
      'v.color as vehicle_color'
    )
    .orderBy(sortColumn, sortOrder)
    .offset(offset)
    .limit(limit);

  return {
    items,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total: parseInt(count, 10),
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Stores a recent search entry for a user.
 */
const saveRecentSearch = async (userId, { origin, destination, searchDate }) => {
  const [search] = await db('recent_searches')
    .insert({
      user_id: userId,
      origin,
      destination,
      search_date: searchDate || null
    })
    .returning('*');

  return search;
};

/**
 * Fetches recent searches for a specific user.
 */
const getRecentSearchesByUserId = async (userId, limit = 5) => {
  return db('recent_searches')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(limit);
};

/**
 * Deletes a recent search entry.
 */
const deleteRecentSearch = async (id, userId) => {
  return db('recent_searches')
    .where({ id, user_id: userId })
    .del();
};

module.exports = {
  searchRides,
  saveRecentSearch,
  getRecentSearchesByUserId,
  deleteRecentSearch
};