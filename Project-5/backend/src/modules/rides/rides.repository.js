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

module.exports = {
  createRide,
  findDriverByUserId,
  findActiveVehicleByDriver,
  findRideById
};