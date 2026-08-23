const repository = require('./vehicles.repositiry');

const getDriverOrThrow = async (userId) => {
  const driver =
    await repository.findDriverByUserId(userId);

  if (!driver) {
    const error = new Error(
      'You must register as a driver first'
    );

    error.code = 'DRIVER_NOT_FOUND';
    error.statusCode = 404;

    throw error;
  }

  return driver;
};

const createVehicle = async (userId, data) => {
  const driver = await getDriverOrThrow(userId);

  const existingVehicle =
    await repository.findActiveVehicleByDriver(
      driver.id
    );

  if (existingVehicle) {
    const error = new Error(
      'Driver already has an active vehicle'
    );

    error.code = 'ACTIVE_VEHICLE_EXISTS';
    error.statusCode = 409;

    throw error;
  }

  return repository.createVehicle({
    driver_id: driver.id,
    make: data.make,
    model: data.model,
    year: data.year,
    color: data.color,
    license_plate: data.licensePlate,
    seat_count: data.seatCount,
    photo_url: data.photoUrl || null,
    is_active: true,
  });
};

const getMyVehicle = async (userId) => {
  const driver = await getDriverOrThrow(userId);

  const vehicle =
    await repository.findActiveVehicleByDriver(
      driver.id
    );

  if (!vehicle) {
    const error = new Error(
      'No active vehicle found'
    );

    error.code = 'VEHICLE_NOT_FOUND';
    error.statusCode = 404;

    throw error;
  }

  return vehicle;
};

const updateVehicle = async (
  userId,
  vehicleId,
  data
) => {
  const driver = await getDriverOrThrow(userId);

  const vehicle =
    await repository.findVehicleByIdAndDriver(
      vehicleId,
      driver.id
    );

  if (!vehicle) {
    const error = new Error(
      'Vehicle not found'
    );

    error.code = 'VEHICLE_NOT_FOUND';
    error.statusCode = 404;

    throw error;
  }

  const updateData = {};

  if (data.make !== undefined)
    updateData.make = data.make;

  if (data.model !== undefined)
    updateData.model = data.model;

  if (data.year !== undefined)
    updateData.year = data.year;

  if (data.color !== undefined)
    updateData.color = data.color;

  if (data.licensePlate !== undefined) {
    updateData.license_plate =
      data.licensePlate;
  }

  if (data.seatCount !== undefined) {
    updateData.seat_count =
      data.seatCount;
  }

  if (data.photoUrl !== undefined) {
    updateData.photo_url =
      data.photoUrl;
  }

  return repository.updateVehicle(
    vehicleId,
    driver.id,
    updateData
  );
};

const deleteVehicle = async (
  userId,
  vehicleId
) => {
  const driver = await getDriverOrThrow(userId);

  const vehicle =
    await repository.findVehicleByIdAndDriver(
      vehicleId,
      driver.id
    );

  if (!vehicle) {
    const error = new Error(
      'Vehicle not found'
    );

    error.code = 'VEHICLE_NOT_FOUND';
    error.statusCode = 404;

    throw error;
  }

  return repository.deactivateVehicle(
    vehicleId,
    driver.id
  );
};

module.exports = {
  createVehicle,
  getMyVehicle,
  updateVehicle,
  deleteVehicle,
};