const db = require('../../config/database');

const createPayment = async (paymentData) => {
  const [payment] = await db('payments')
    .insert(paymentData)
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