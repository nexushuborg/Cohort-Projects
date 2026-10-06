const db = require('../../config/database');

const createPayment = async (paymentData) => {
  const payload = {
    rider_id: paymentData.user_id,
    booking_id: paymentData.ride_id,
    amount: paymentData.amount,
    method: paymentData.payment_method,
    status: paymentData.status
  };

  const [payment] = await db('payments')
    .insert(payload)
    .returning('*');
  return payment;
};

const updatePaymentStatus = async (paymentId, status, transactionRef) => {
  const [payment] = await db('payments')
    .where({ id: paymentId })
    .update({ 
      status, 
      transaction_id: transactionRef
    })
    .returning('*');
  return payment;
};

const getPaymentsByUserId = async (userId) => {
  return db('payments')
    .where({ rider_id: userId })
    .orderBy('created_at', 'desc');
};

module.exports = {
  createPayment,
  updatePaymentStatus,
  getPaymentsByUserId,
};