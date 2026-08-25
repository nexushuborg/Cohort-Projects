import { useState, useEffect } from 'react';
import { dashboardAPI, driverAPI } from '../../services/api';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import styles from './DriverDashboard.module.css';

export default function DriverDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await dashboardAPI.getDriver();
      if (res.success) setData(res.data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    setStatusLoading(true);
    try {
      await driverAPI.updateStatus(status);
      fetchData();
    } catch {
      // handle
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Driver Dashboard</h1>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>${data?.totalEarnings?.toFixed(2) || '0.00'}</div>
          <div className={styles.statLabel}>Total Earnings</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data?.totalTrips || 0}</div>
          <div className={styles.statLabel}>Trips Completed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data?.averageRating?.toFixed(1) || '—'}</div>
          <div className={styles.statLabel}>Average Rating</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{data?.activeRides || 0}</div>
          <div className={styles.statLabel}>Active Rides</div>
        </div>
      </div>

      <div className={styles.statusSection}>
        <div className={styles.statusTitle}>Driver Status</div>
        <div className={styles.statusToggle}>
          {['offline', 'online', 'on_trip'].map((s) => (
            <Button
              key={s}
              variant={data?.status === s ? 'primary' : 'secondary'}
              size="sm"
              loading={statusLoading}
              onClick={() => handleStatusChange(s)}
            >
              {s === 'on_trip' ? 'On Trip' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
        <div style={{ marginTop: 'var(--space-3)' }}>
          Current: <Badge status={data?.status}>{data?.status?.replace('_', ' ') || 'offline'}</Badge>
        </div>
      </div>
    </div>
  );
}
