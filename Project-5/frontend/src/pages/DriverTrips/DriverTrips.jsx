import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { rideAPI, bookingAPI, ratingAPI } from '../../services/api';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Spinner from '../../components/Spinner/Spinner';
import { Input, Textarea } from '../../components/Input/Input';
import styles from './DriverTrips.module.css';

export default function DriverTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ open: false, booking: null });
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingText, setRatingText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const { data } = await rideAPI.search({ driver: 'me' });
      if (data.success) {
        setTrips(data.data?.items || data.data || []);
      }
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      await bookingAPI.accept(bookingId);
      fetchTrips();
    } catch {
      // handle
    }
  };

  const handleDecline = async (bookingId) => {
    try {
      await bookingAPI.decline(bookingId);
      fetchTrips();
    } catch {
      // handle
    }
  };

  const handleStartTrip = async (bookingId) => {
    try {
      await bookingAPI.start(bookingId);
      fetchTrips();
    } catch {
      // handle
    }
  };

  const handleCompleteTrip = async (bookingId) => {
    try {
      await bookingAPI.complete(bookingId);
      setRatingModal({ open: true, booking: { id: bookingId } });
      fetchTrips();
    } catch {
      // handle
    }
  };

  const handleRate = async () => {
    if (!ratingModal.booking || ratingValue === 0) return;
    setSubmittingRating(true);
    try {
      await ratingAPI.create({
        bookingId: ratingModal.booking.id,
        rating: ratingValue,
        text: ratingText || undefined,
      });
      setRatingModal({ open: false, booking: null });
      setRatingValue(0);
      setRatingText('');
    } catch {
      // handle
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>My Trips</h1>
        <Button onClick={() => navigate('/post-ride')}>Post New Ride</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : trips.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No trips yet</h3>
          <p>Post your first ride to start earning.</p>
          <Button onClick={() => navigate('/post-ride')} style={{ marginTop: 'var(--space-4)' }}>
            Post a Ride
          </Button>
        </div>
      ) : (
        <div className={styles.tripList}>
          {trips.map((trip) => (
            <div key={trip.id} className={styles.tripCard}>
              <div className={styles.tripHeader}>
                <span className={styles.routeText}>
                  {trip.originCity} → {trip.destinationCity}
                </span>
                <Badge status={trip.status}>{trip.status?.replace('_', ' ')}</Badge>
              </div>
              <div className={styles.tripMeta}>
                <span>{format(new Date(trip.departureAt), 'MMM d, h:mm a')}</span>
                <span>{trip.availableSeats}/{trip.totalSeats} seats available</span>
                <span>${trip.pricePerSeat}/seat</span>
              </div>

              {trip.bookings && trip.bookings.length > 0 && (
                <div className={styles.bookingsSection}>
                  <div className={styles.bookingsTitle}>Booking Requests</div>
                  {trip.bookings.map((booking) => (
                    <div key={booking.id} className={styles.bookingRequest}>
                      <div>
                        <div className={styles.bookingRider}>{booking.rider?.name || 'Rider'}</div>
                        <div className={styles.bookingInfo}>
                          {booking.seatsBooked} seat(s) · ${booking.totalAmount} ·{' '}
                          <Badge status={booking.status} variant="info">{booking.status}</Badge>
                        </div>
                      </div>
                      {booking.status === 'requested' && (
                        <div className={styles.bookingActions}>
                          <Button size="sm" onClick={() => handleAccept(booking.id)}>Accept</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDecline(booking.id)}>Decline</Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.tripActions}>
                {trip.status === 'active' && (
                  <Button variant="success" size="sm" onClick={() => handleStartTrip(trip.id)}>
                    Start Trip
                  </Button>
                )}
                {trip.status === 'in_progress' && (
                  <Button variant="success" size="sm" onClick={() => handleCompleteTrip(trip.id)}>
                    Complete Trip
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={ratingModal.open}
        onClose={() => setRatingModal({ open: false, booking: null })}
        title="Rate Rider"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRatingModal({ open: false, booking: null })}>Skip</Button>
            <Button onClick={handleRate} loading={submittingRating} disabled={ratingValue === 0}>Submit</Button>
          </>
        }
      >
        <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--space-4)' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{
                fontSize: 'var(--font-size-xl)',
                cursor: 'pointer',
                color: star <= ratingValue ? 'var(--color-warning)' : 'var(--color-border)',
              }}
              onClick={() => setRatingValue(star)}
            >
              ★
            </span>
          ))}
        </div>
        <Textarea
          label="Review (optional)"
          name="review"
          placeholder="How was this rider?"
          value={ratingText}
          onChange={(e) => setRatingText(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
}
