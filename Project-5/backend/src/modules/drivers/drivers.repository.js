const db = require('../../config/database');

const findDriverByUserId = async (userId) => {
  return db('driver_profiles')
    .where({ user_id: userId })
    .first();
};

const createDriver = async (data) => {
  const [driver] = await db('driver_profiles')
    .insert(data)
    .returning([
      'id',
      'user_id',
      'status',
      'license_number',
      'is_verified',
      'avg_rating',
      'total_trips',
      'created_at',
      'updated_at',
    ]);

  return driver;
};

const updateDriverStatus = async (userId, status) => {
  const [driver] = await db('driver_profiles')
    .where({ user_id: userId })
    .update({
      status,
      updated_at: db.fn.now(),
    })
    .returning([
      'id',
      'user_id',
      'status',
      'license_number',
      'is_verified',
      'avg_rating',
      'total_trips',
      'updated_at',
    ]);

  return driver;
};

const findPublicDriverById = async (driverId) => {
  return db('driver_profiles')
    .join(
      'users',
      'driver_profiles.user_id',
      'users.id'
    )
    .where('driver_profiles.id', driverId)
    .select(
      'driver_profiles.id',
      'driver_profiles.status',
      'driver_profiles.is_verified',
      'driver_profiles.avg_rating',
      'driver_profiles.total_trips',
      'users.name',
      'users.avatar_url'
    )
    .first();
};

module.exports = {
  findDriverByUserId,
  createDriver,
  updateDriverStatus,
  findPublicDriverById,
};