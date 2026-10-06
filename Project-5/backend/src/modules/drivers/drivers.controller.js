const service = require('./drivers.service');

const {
  registerDriverSchema,
  updateStatusSchema,
} = require('./drivers.validation');

const registerDriver = async (req, res, next) => {
  try {
    const { error, value } =
      registerDriverSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      });
    }

    const driver = await service.registerDriver(
      req.user.sub,
      value.licenseNumber
    );

    return res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const getMyDriverProfile = async (req, res, next) => {
  try {
    const driver =
      await service.getMyDriverProfile(req.user.sub);

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const updateDriverStatus = async (req, res, next) => {
  try {
    const { error, value } =
      updateStatusSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      });
    }

    const driver =
      await service.updateDriverStatus(
        req.user.sub,
        value.status
      );

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

const getPublicDriver = async (req, res, next) => {
  try {
    const driver =
      await service.getPublicDriver(req.params.id);

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerDriver,
  getMyDriverProfile,
  updateDriverStatus,
  getPublicDriver,
};