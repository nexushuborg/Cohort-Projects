const db = require('../../config/database');
const paymentRepo = require('./payment.repository');

const processPaymentMock = async ({ userId, rideId, amount, paymentMethod }) => {
  const payment = await paymentRepo.createPayment({
    user_id: userId,
    ride_id: rideId || null,
    amount,
    payment_method: paymentMethod,
    status: 'PENDING'
  });

  // Simulate payment gateway delay & verification
  const isSuccess = Math.random() > 0.05; // 95% success rate simulation
  const status = isSuccess ? 'COMPLETED' : 'FAILED';
  const transactionRef = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const updatedPayment = await paymentRepo.updatePaymentStatus(payment.id, status, transactionRef);

  return updatedPayment;
};

const deductFareFromWallet = async (userId, rideId, amount) => {
  return db.transaction(async (trx) => {
    const wallet = await trx('wallet').where({ user_id: userId }).first();

    if (!wallet || parseFloat(wallet.balance) < parseFloat(amount)) {
      throw new Error('INSUFFICIENT_WALLET_BALANCE');
    }

    const newBalance = parseFloat(wallet.balance) - parseFloat(amount);

    await trx('wallet')
      .where({ id: wallet.id })
      .update({ balance: newBalance, updated_at: db.fn.now() });

    await trx('wallet_transactions').insert({
      wallet_id: wallet.id,
      amount,
      type: 'DEBIT',
      description: `Ride Fare Payment for Ride #${rideId}`,
      status: 'SUCCESS'
    });

    const payment = await trx('payments').insert({
      user_id: userId,
      ride_id: rideId,
      amount,
      payment_method: 'WALLET',
      status: 'COMPLETED',
      transaction_reference: `RIDE_PAY_${rideId}_${Date.now()}`
    }).returning('*');

    return { success: true, payment: payment[0], newBalance };
  });
};

module.exports = {
  processPaymentMock,
  deductFareFromWallet,
};