import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rideAPI, bookingAPI, extractError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Input, Select } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import Modal from '../../components/Modal/Modal';
import Spinner from '../../components/Spinner/Spinner';
import RoutePreview from '../../components/RoutePreview/RoutePreview';
import { formatDateSafe, formatRupees } from '../../utils/format';
import styles from './RideDetail.module.css';

export default function RideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState('1');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRide();
  }, [id]);

  const fetchRide = async () => {
    setLoading(true);
    try {
      const { data } = await rideAPI.getById(id);
      if (data.success) {
        setRide(data.data);
      }
    } catch {
      setError('Ride not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    setBooking(true);
    setError('');
    try {
      const { data } = await bookingAPI.create({
        rideId: id,
        seatsBooked: parseInt(seatsToBook, 10),
        message: message || undefined,
      });
      if (data.success) {
        setSuccess('Booking request sent! Waiting for driver confirmation.');
        setShowBookingModal(false);
      }
    } catch (err) {
      const extracted = extractError(err);
      setError(extracted.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <Spinner />;

  if (!ride) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div className={styles.emptyState}><h3>Ride not found</h3></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

      <RoutePreview
        originLat={ride.origin_lat || ride.originLat}
        originLng={ride.origin_lng || ride.originLng}
        destinationLat={ride.destination_lat || ride.destinationLat}
        destinationLng={ride.destination_lng || ride.destinationLng}
        variant="detail"
      />

      <div className={styles.routeHeader}>
        <div className={styles.routeCities}>
          <span>{ride.originCity}</span>
          <span className={styles.routeArrow}>→</span>
          <span>{ride.destinationCity}</span>
        </div>
        <div className={styles.routeAddresses}>
          {ride.originAddress} to {ride.destinationAddress}
        </div>
      </div>

      {ride.driver && (
        <div className={styles.driverCard}>
          <div className={styles.driverAvatar}>{ride.driver.name?.charAt(0)}</div>
          <div>
            <div className={styles.driverName}>{ride.driver.name}</div>
            <div className={styles.driverMeta}>
              ★ {ride.driver.avgRating || 'New'} · {ride.driver.totalTrips || 0} trips
            </div>
          </div>
        </div>
      )}

      <div className={styles.detailCard}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Departure</span>
          <span className={styles.detailValue}>{formatDateSafe(ride.departureAt, 'MMM d, yyyy · h:mm a')}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Available Seats</span>
          <span className={styles.detailValue}>{ride.availableSeats}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Vehicle</span>
          <span className={styles.detailValue}>
            {ride.vehicle ? `${ride.vehicle.year || ''} ${ride.vehicle.make} ${ride.vehicle.model}` : 'N/A'}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Status</span>
          <Badge status={ride.status}>{ride.status?.replace('_', ' ')}</Badge>
        </div>
      </div>

      {ride.notes && (
        <div className={styles.notes}>{ride.notes}</div>
      )}

      {success && (
        <div style={{ padding: 'var(--space-4)', background: '#E6F9EF', color: '#06C167', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ padding: 'var(--space-4)', background: '#FDECEB', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          {error}
        </div>
      )}

      {ride.status === 'active' && ride.availableSeats > 0 && (
        <div className={styles.bookSection}>
          <div className={styles.priceHighlight}>
            {formatRupees(ride.pricePerSeat)} <span className={styles.priceSubtext}>per seat</span>
          </div>
          {isAuthenticated ? (
            <Button fullWidth onClick={() => setShowBookingModal(true)}>
              Request to Book
            </Button>
          ) : (
            <Button fullWidth onClick={() => navigate('/login', { state: { from: { pathname: `/rides/${id}` } } })}>
              Log in to Book
            </Button>
          )}
        </div>
      )}

      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Confirm Booking"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowBookingModal(false)}>Cancel</Button>
            <Button onClick={handleBook} loading={booking}>Confirm Booking</Button>
          </>
        }
      >
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            {formatRupees(ride.pricePerSeat)}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {ride.originCity} → {ride.destinationCity}
          </div>
        </div>
        <Select
          label="Seats to book"
          name="seats"
          value={seatsToBook}
          onChange={(e) => setSeatsToBook(e.target.value)}
          options={Array.from({ length: ride.availableSeats }, (_, i) => ({
            value: String(i + 1),
            label: `${i + 1} seat${i > 0 ? 's' : ''}`,
          }))}
        />
        <Input
          label="Message (optional)"
          name="message"
          placeholder="Share any details with the driver..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-3)' }}>
          Total: <strong>{formatRupees(Number(ride.pricePerSeat || 0) * parseInt(seatsToBook, 10))}</strong>
        </div>
      </Modal>
    </div>
  );
}
