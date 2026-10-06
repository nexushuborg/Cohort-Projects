import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import { formatDateSafe, formatDistanceSafe } from '../../utils/format';
import styles from './RiderDashboard.module.css';

export default function RiderDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ upcomingRides: [], pastTrips: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await dashboardAPI.getRider();
      if (res.success) setData(res.data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  const upcoming = data?.upcomingRides || [];
  const past = data?.pastTrips || data?.pastRides || [];

  return (
    <div className={styles.container}>
      <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>
        Rider Dashboard
      </h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Rides</h2>
        {upcoming.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No upcoming rides.</p>
            <Button onClick={() => navigate('/search')} style={{ marginTop: 'var(--space-3)' }}>
              Find Rides
            </Button>
          </div>
        ) : (
          <div className={styles.tripList}>
            {upcoming.map((ride) => (
              <div
                key={ride.id}
                className={styles.tripCard}
                onClick={() => navigate(`/rides/${ride.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.tripInfo}>
                  <span className={styles.routeText}>
                    {ride.originCity || ride.originAddress} → {ride.destinationCity || ride.destinationAddress}
                  </span>
                  <span className={styles.tripMeta}>
                    {formatDateSafe(ride.departureAt)}
                  </span>
                  <span className={styles.countdown}>
                    Departing {formatDistanceSafe(ride.departureAt)}
                  </span>
                </div>
                <Badge status={ride.status}>{ride.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Past Trips</h2>
        {past.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No past trips yet.</p>
          </div>
        ) : (
          <div className={styles.tripList}>
            {past.map((ride) => (
              <div key={ride.id} className={styles.tripCard}>
                <div className={styles.tripInfo}>
                  <span className={styles.routeText}>
                    {ride.originCity || ride.originAddress} → {ride.destinationCity || ride.destinationAddress}
                  </span>
                  <span className={styles.tripMeta}>
                    {formatDateSafe(ride.departureAt)}
                  </span>
                </div>
                <Badge status="completed">completed</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
