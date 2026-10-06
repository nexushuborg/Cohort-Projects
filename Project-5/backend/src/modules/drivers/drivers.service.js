const repository = require('./drivers.repository');

const registerDriver = async (userId, licenseNumber) => {
  const existingDriver = await repository.findDriverByUserId(userId);

  if (existingDriver) {
    const error = new Error(
      'User is already registered as a driver'
    );

    error.code = 'DRIVER_ALREADY_EXISTS';
    error.statusCode = 409;

    throw error;
  }

  return repository.createDriver({
    user_id: userId,
    license_number: licenseNumber || null,
  });
};

const getMyDriverProfile = async (userId) => {
  const driver = await repository.findDriverByUserId(userId);

  if (!driver) {
    const error = new Error(
      'Driver profile not found'
    );

    error.code = 'DRIVER_NOT_FOUND';
    error.statusCode = 404;

    throw error;
  }

  return driver;
};

const updateDriverStatus = async (userId, status) => {
  const driver = await repository.findDriverByUserId(userId);

  if (!driver) {
    const error = new Error(
      'Driver profile not found'
    );

    error.code = 'DRIVER_NOT_FOUND';
    error.statusCode = 404;

    throw error;
  }

  return repository.updateDriverStatus(
    userId,
    status
  );
};

const getPublicDriver = async (driverId) => {
  const driver = await repository.findPublicDriverById(
    driverId
  );

  if (!driver) {
    const error = new Error('Driver not found');

    error.code = 'DRIVER_NOT_FOUND';
    error.statusCode = 404;

    throw error;
  }

  return driver;
};

module.exports = {
  registerDriver,
  getMyDriverProfile,
  updateDriverStatus,
  getPublicDriver,
};