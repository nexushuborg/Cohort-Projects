const db = require('../../config/database');

const findDriverByUserId = async (userId) => {
  return db('driver_profiles')
    .where({ user_id: userId })
    .first();
};

const findActiveVehicleByDriver = async (driverId) => {
  return db('vehicles')
    .where({
      driver_id: driverId,
      is_active: true,
    })
    .first();
};

const findVehicleByIdAndDriver = async (
  vehicleId,
  driverId
) => {
  return db('vehicles')
    .where({
      id: vehicleId,
      driver_id: driverId,
    })
    .first();
};

const createVehicle = async (data) => {
  const [vehicle] = await db('vehicles')
    .insert(data)
    .returning([
      'id',
      'driver_id',
      'make',
      'model',
      'year',
      'color',
      'license_plate',
      'seat_count',
      'photo_url',
      'is_active',
      'created_at',
      'updated_at',
    ]);

  return vehicle;
};

const updateVehicle = async (
  vehicleId,
  driverId,
  data
) => {
  const [vehicle] = await db('vehicles')
    .where({
      id: vehicleId,
      driver_id: driverId,
    })
    .update({
      ...data,
      updated_at: db.fn.now(),
    })
    .returning([
      'id',
      'driver_id',
      'make',
      'model',
      'year',
      'color',
      'license_plate',
      'seat_count',
      'photo_url',
      'is_active',
      'updated_at',
    ]);

  return vehicle;
};

const deactivateVehicle = async (
  vehicleId,
  driverId
) => {
  const [vehicle] = await db('vehicles')
    .where({
      id: vehicleId,
      driver_id: driverId,
    })
    .update({
      is_active: false,
      updated_at: db.fn.now(),
    })
    .returning([
      'id',
      'is_active',
      'updated_at',
    ]);

  return vehicle;
};

module.exports = {
  findDriverByUserId,
  findActiveVehicleByDriver,
  findVehicleByIdAndDriver,
  createVehicle,
  updateVehicle,
  deactivateVehicle,
};