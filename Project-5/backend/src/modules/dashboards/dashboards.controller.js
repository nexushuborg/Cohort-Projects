const dashboardRepo = require('./dashboards.repository');

const getDriverDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user.userId || req.user.sub;
    const stats = await dashboardRepo.getDriverStats(userId);
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
    const userId = req.user.id || req.user.userId || req.user.sub;
    const stats = await dashboardRepo.getRiderStats(userId);
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