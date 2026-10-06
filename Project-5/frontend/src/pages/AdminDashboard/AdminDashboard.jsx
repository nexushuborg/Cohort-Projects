import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import Spinner from '../../components/Spinner/Spinner';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await dashboardAPI.getAdmin();
      if (res.success) setData(res.data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const cards = [
    { icon: '👥', value: data?.totalUsers || 0, label: 'Total Users' },
    { icon: '🚗', value: data?.activeDrivers || 0, label: 'Active Drivers' },
    { icon: '🗺️', value: data?.liveRides || 0, label: 'Live Rides' },
    { icon: '📋', value: data?.totalBookings || 0, label: 'Total Bookings' },
  ];

  return (
    <div className={styles.container}>
      <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>
        Admin Overview
      </h1>

      <div className={styles.statsGrid}>
        {cards.map((card) => (
          <div key={card.label} className={styles.statCard}>
            <div className={styles.statIcon}>{card.icon}</div>
            <div className={styles.statValue}>{card.value}</div>
            <div className={styles.statLabel}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
