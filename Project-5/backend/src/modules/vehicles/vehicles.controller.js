const service = require('./vehicles.service');

const {
  createVehicleSchema,
  updateVehicleSchema,
} = require('./vehicles.validation');

const createVehicle = async (req, res, next) => {
  try {
    const { error, value } =
      createVehicleSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      });
    }

    const vehicle =
      await service.createVehicle(
        req.user.sub,
        value
      );

    return res.status(201).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const getMyVehicle = async (req, res, next) => {
  try {
    const vehicle =
      await service.getMyVehicle(req.user.sub);

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const { error, value } =
      updateVehicleSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      });
    }

    const vehicle =
      await service.updateVehicle(
        req.user.sub,
        req.params.id,
        value
      );

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle =
      await service.deleteVehicle(
        req.user.sub,
        req.params.id
      );

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVehicle,
  getMyVehicle,
  updateVehicle,
  deleteVehicle,
};