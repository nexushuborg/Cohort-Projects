const dashboardRepo = require('./dashboards.repository');

const getDriverDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardRepo.getDriverStats(req.user.id);
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Driver profile not found' }
      });
    }

    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getRiderDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardRepo.getRiderStats(req.user.id);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardRepo.getAdminStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDriverDashboard,
  getRiderDashboard,
  getAdminDashboard
};