import { useState, useEffect } from 'react';
import { walletAPI, extractError } from '../../services/api';
import { Input } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import { formatDateSafe } from '../../utils/format';
import styles from './Wallet.module.css';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
      ]);
      if (walletRes.data.success) setWallet(walletRes.data.data);
      if (txRes.data.success) {
        setTransactions(txRes.data.data?.items || txRes.data.data?.transactions || []);
      }
    } catch {
      // Not a driver yet
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setProcessing(true);
    setMessage('');
    try {
      await walletAPI.topUp({ amount: parseFloat(amount) });
      setAmount('');
      setMessage('Top-up successful!');
      fetchWallet();
    } catch (err) {
      const extracted = extractError(err);
      setMessage(extracted.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setProcessing(true);
    setMessage('');
    try {
      await walletAPI.withdraw({ amount: parseFloat(amount) });
      setAmount('');
      setMessage('Withdrawal processed!');
      fetchWallet();
    } catch (err) {
      const extracted = extractError(err);
      setMessage(extracted.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className={styles.container}>
      <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>Wallet</h1>

      {message && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: message.includes('failed') || message.includes('Failed') ? '#FDECEB' : '#E6F9EF',
          color: message.includes('failed') || message.includes('Failed') ? 'var(--color-danger)' : '#06C167',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
          fontWeight: 500,
        }}>
          {message}
        </div>
      )}

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>${Number(wallet?.balance || 0).toFixed(2)}</div>
          <div className={styles.statLabel}>Balance</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>${Number(wallet?.totalEarned || 0).toFixed(2)}</div>
          <div className={styles.statLabel}>Total Earned</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>${Number(wallet?.totalWithdrawn || 0).toFixed(2)}</div>
          <div className={styles.statLabel}>Total Withdrawn</div>
        </div>
      </div>

      <div className={styles.actionsRow}>
        <div className={styles.actionCard}>
          <h3 className={styles.actionTitle}>Top Up Balance</h3>
          <form onSubmit={handleTopUp}>
            <Input
              label="Amount ($)"
              name="topupAmount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button type="submit" fullWidth loading={processing}>Top Up</Button>
          </form>
        </div>
        <div className={styles.actionCard}>
          <h3 className={styles.actionTitle}>Withdraw Funds</h3>
          <form onSubmit={handleWithdraw}>
            <Input
              label="Amount ($)"
              name="withdrawAmount"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Button type="submit" fullWidth variant="secondary" loading={processing}>Withdraw</Button>
          </form>
        </div>
      </div>

      <h2 className={styles.transactionsTitle}>Transaction History</h2>

      {transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No transactions yet.</p>
        </div>
      ) : (
        <div className={styles.transactionList}>
          {transactions.map((tx) => (
            <div key={tx.id} className={styles.transactionItem}>
              <div className={styles.transactionInfo}>
                <span className={styles.transactionDesc}>{tx.description || tx.type}</span>
                <span className={styles.transactionDate}>
                  {formatDateSafe(tx.created_at, 'MMM d, yyyy · h:mm a')}
                </span>
              </div>
              <span
                  className={[styles.transactionAmount, tx.type?.toLowerCase() === 'credit' ? styles.amountCredit : styles.amountDebit]
                  .filter(Boolean).join(' ')}
              >
                {tx.type?.toLowerCase() === 'credit' ? '+' : '-'}${Number(tx.amount || 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
