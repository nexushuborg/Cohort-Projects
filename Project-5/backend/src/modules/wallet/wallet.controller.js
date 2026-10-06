const walletRepo = require('./wallet.repository');

const getBalance = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const wallet = await walletRepo.getOrCreateWallet(userId);

    res.status(200).json({
      success: true,
      data: {
        walletId: wallet.id,
        balance: parseFloat(wallet.balance),
        currency: wallet.currency
      }
    });
  } catch (err) {
    next(err);
  }
};

const topUp = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { amount, referenceId } = req.body;

    const result = await walletRepo.topUpBalance(userId, amount, referenceId);

    res.status(200).json({
      success: true,
      data: {
        message: 'Wallet topped up successfully',
        balance: parseFloat(result.wallet.balance),
        transaction: result.transaction
      }
    });
  } catch (err) {
    next(err);
  }
};

const getTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const wallet = await walletRepo.getOrCreateWallet(userId);
    const transactions = await walletRepo.getTransactions(wallet.id);

    res.status(200).json({
      success: true,
      data: {
        transactions
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBalance,
  topUp,
  getTransactionHistory
};