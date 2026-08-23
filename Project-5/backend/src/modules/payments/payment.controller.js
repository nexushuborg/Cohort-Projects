const paymentService = require('./payment.service');
const paymentRepo = require('./payment.repository');

const processPayment = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { rideId, amount, paymentMethod } = req.body;

    const payment = await paymentService.processPaymentMock({
      userId,
      rideId,
      amount,
      paymentMethod
    });

    res.status(200).json({
      success: true,
      data: { payment }
    });
  } catch (err) {
    next(err);
  }
};

const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const payments = await paymentRepo.getPaymentsByUserId(userId);

    res.status(200).json({
      success: true,
      data: { payments }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processPayment,
  getPaymentHistory,
};