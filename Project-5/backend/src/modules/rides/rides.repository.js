const db = require('../../config/database');

const createRide = async (rideData) => {
  const [ride] = await db('rides')
    .insert(rideData)
    .returning('*');

  return ride;
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
    .where({ id: rideId })
    .first();
};

module.exports = {
  createRide,
  findActiveVehicleByDriver,
  findRideById
};