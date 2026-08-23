const db = require('../../config/database');

const createPayment = async (paymentData) => {
  const payload = {
    user_id: paymentData.user_id,
    ride_id: paymentData.ride_id || null,
    amount: paymentData.amount,
    method: paymentData.payment_method, // Maps payment_method to table column 'method'
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
      transaction_reference: transactionRef,
      updated_at: db.fn.now() 
    })
    .returning('*');
  return payment;
};

const getPaymentsByUserId = async (userId) => {
  return db('payments')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc');
};

module.exports = {
  createPayment,
  updatePaymentStatus,
  getPaymentsByUserId,
};