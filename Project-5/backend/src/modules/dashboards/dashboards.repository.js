const db = require('../../config/database');

/**
 * Aggregates summary statistics for a driver.
 */
const getDriverStats = async (userId) => {
  const driver = await db('driver_profiles').where({ user_id: userId }).first();
  if (!driver) return null;

  const earnings = await db('wallet')
    .where({ driver_id: driver.id })
    .first();

  const totalRides = await db('rides')
    .where({ driver_id: driver.id, status: 'completed' })
    .count('id as count')
    .first();

  return {
    totalEarnings: parseFloat(earnings?.total_earned || 0).toFixed(2),
    totalTrips: parseInt(totalRides?.count || 0, 10),
    avgRating: parseFloat(driver.avg_rating || 0).toFixed(1),
    status: driver.status
  };
};

/**
 * Fetches rider dashboard metrics and upcoming/past trips.
 */
const getRiderStats = async (userId) => {
  const upcoming = await db('ride_bookings as rb')
    .join('rides as r', 'rb.ride_id', 'r.id')
    .select('rb.*', 'r.origin_city', 'r.destination_city', 'r.departure_at', 'r.status as ride_status')
    .where('rb.rider_id', userId)
    .andWhere('r.departure_at', '>=', db.fn.now())
    .orderBy('r.departure_at', 'asc');

  const past = await db('ride_bookings as rb')
    .join('rides as r', 'rb.ride_id', 'r.id')
    .select('rb.*', 'r.origin_city', 'r.destination_city', 'r.departure_at', 'r.status as ride_status')
    .where('rb.rider_id', userId)
    .andWhere('r.departure_at', '<', db.fn.now())
    .orderBy('r.departure_at', 'desc')
    .limit(10);

  return { upcomingRides: upcoming, pastRides: past };
};

/**
 * Aggregates high-level admin metrics.
 */
const getAdminStats = async () => {
  const users = await db('users').count('id as count').first();
  const drivers = await db('driver_profiles').count('id as count').first();
  const rides = await db('rides').where({ status: 'active' }).count('id as count').first();
  const bookings = await db('ride_bookings').where({ status: 'completed' }).count('id as count').first();

  return {
    totalUsers: parseInt(users?.count || 0, 10),
    totalDrivers: parseInt(drivers?.count || 0, 10),
    activeRides: parseInt(rides?.count || 0, 10),
    completedBookings: parseInt(bookings?.count || 0, 10)
  };
};

module.exports = {
  getDriverStats,
  getRiderStats,
  getAdminStats
};