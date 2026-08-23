const db = require('../../config/database');

// Find wallet by user ID or create one if it doesn't exist
const getOrCreateWallet = async (userId) => {
  let wallet = await db('wallet').where({ user_id: userId }).first();
  if (!wallet) {
    const [newWallet] = await db('wallet')
      .insert({ user_id: userId, balance: 0.00, currency: 'INR' })
      .returning('*');
    wallet = newWallet;
  }
  return wallet;
};

// Add funds to wallet with database transaction
const topUpBalance = async (userId, amount, referenceId) => {
  return db.transaction(async (trx) => {
    let wallet = await trx('wallet').where({ user_id: userId }).first();
    if (!wallet) {
      const [newWallet] = await trx('wallet')
        .insert({ user_id: userId, balance: 0.00, currency: 'INR' })
        .returning('*');
      wallet = newWallet;
    }

    const newBalance = parseFloat(wallet.balance) + parseFloat(amount);

    const [updatedWallet] = await trx('wallet')
      .where({ id: wallet.id })
      .update({ balance: newBalance, updated_at: db.fn.now() })
      .returning('*');

    const [transaction] = await trx('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        amount,
        type: 'CREDIT',
        description: `Top-up via Payment Ref: ${referenceId || 'DIRECT'}`,
        status: 'SUCCESS'
      })
      .returning('*');

    return { wallet: updatedWallet, transaction };
  });
};

// Fetch wallet transaction history
const getTransactions = async (walletId) => {
  return db('wallet_transactions')
    .where({ wallet_id: walletId })
    .orderBy('created_at', 'desc');
};

module.exports = {
  getOrCreateWallet,
  topUpBalance,
  getTransactions
};