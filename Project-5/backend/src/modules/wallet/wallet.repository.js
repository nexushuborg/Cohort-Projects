const db = require('../../config/database');

// Helper to find driver_id from user_id
const getDriverByUserId = async (userId) => {
  return db('driver_profiles').where({ user_id: userId }).first();
};

// Find wallet by user ID (via driver profile) or create one if driver profile exists
const getOrCreateWallet = async (userId) => {
  let driver = await getDriverByUserId(userId);

  // Fallback: If user is not yet registered as driver, retrieve or create driver profile shell
  if (!driver) {
    const [newDriver] = await db('driver_profiles')
      .insert({ user_id: userId, status: 'PENDING' })
      .returning('*');
    driver = newDriver;
  }

  let wallet = await db('wallet').where({ driver_id: driver.id }).first();

  if (!wallet) {
    const [newWallet] = await db('wallet')
      .insert({ driver_id: driver.id, balance: 0.00 })
      .returning('*');
    wallet = newWallet;
  }

  return wallet;
};

// Add funds to wallet with database transaction
const topUpBalance = async (userId, amount, referenceId) => {
  return db.transaction(async (trx) => {
    let driver = await trx('driver_profiles').where({ user_id: userId }).first();

    if (!driver) {
      const [newDriver] = await trx('driver_profiles')
        .insert({ user_id: userId, status: 'PENDING' })
        .returning('*');
      driver = newDriver;
    }

    let wallet = await trx('wallet').where({ driver_id: driver.id }).first();

    if (!wallet) {
      const [newWallet] = await trx('wallet')
        .insert({ driver_id: driver.id, balance: 0.00 })
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
        description: `Top-up via Ref: ${referenceId || 'DIRECT'}`
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