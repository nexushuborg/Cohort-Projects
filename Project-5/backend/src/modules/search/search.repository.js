const db = require('../../config/database');

/**
 * Searches rides with dynamic filters and sorting options.
 */
const searchRides = async ({ origin, destination, date, seats = 1, sortBy = 'departure_at', order = 'asc', page = 1, limit = 20 }) => {
  const query = db('rides as r')
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
    .where('r.status', 'active')
    .andWhere('r.available_seats', '>=', seats);

  if (origin) {
    query.whereILike('r.origin_city', `%${origin}%`);
  }

  if (destination) {
    query.whereILike('r.destination_city', `%${destination}%`);
  }

  if (date) {
    query.whereRaw('DATE(r.departure_at) = DATE(?)', [date]);
  }

  const allowedSortFields = ['price_per_seat', 'departure_at'];
  const sortColumn = allowedSortFields.includes(sortBy) ? `r.${sortBy}` : 'r.departure_at';
  const sortOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc';

  const offset = (page - 1) * limit;

  const [{ count }] = await query.clone().count('r.id as count');
  const items = await query.orderBy(sortColumn, sortOrder).offset(offset).limit(limit);

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