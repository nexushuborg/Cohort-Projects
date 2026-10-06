const db = require('../../config/database');

const createRide = async (rideData) => {
  const [ride] = await db('rides')
    .insert(rideData)
    .returning('*');

  return ride;
};

const findDriverByUserId = async (userId) => {
  return db('driver_profiles')
    .where({
      user_id: userId
    })
    .first();
};

const findActiveVehicleByDriver = async (driverId) => {
  return db('vehicles')
    .where({
      driver_id: driverId,
      is_active: true
    })
    .first();
};

const findRideById = async (rideId) => {
  return db('rides')
    .where({
      id: rideId
    })
    .first();
};

const findRidesByDriverId = async (driverId) => {
  return db('rides as r')
    .leftJoin('vehicles as v', 'r.vehicle_id', 'v.id')
    .where('r.driver_id', driverId)
    .orderBy('r.created_at', 'desc')
    .select(
      'r.*',
      'v.make as vehicle_make',
      'v.model as vehicle_model',
      'v.color as vehicle_color',
      'v.license_plate as vehicle_license_plate'
    );
};

const updateRideStatus = async (rideId, status) => {
  const [updated] = await db('rides')
    .where({ id: rideId })
    .update({ status, updated_at: new Date() })
    .returning('*');
  return updated;
};

module.exports = {
  createRide,
  findDriverByUserId,
  findActiveVehicleByDriver,
  findRideById,
  findRidesByDriverId,
  updateRideStatus
};