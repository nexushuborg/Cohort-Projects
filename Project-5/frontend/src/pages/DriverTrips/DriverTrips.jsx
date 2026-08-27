import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI, bookingAPI, ratingAPI } from '../../services/api';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Spinner from '../../components/Spinner/Spinner';
import { Textarea } from '../../components/Input/Input';
import { formatDateSafe } from '../../utils/format';
import styles from './DriverTrips.module.css';

// Helpers to safely resolve snake_case (PostgreSQL) or camelCase (JS) fields
const tripOrigin = (t) => t.origin_city || t.originCity || 'Origin';
const tripDest = (t) => t.destination_city || t.destinationCity || 'Destination';
const tripDeparture = (t) => t.departure_at || t.departureAt;
const tripSeatsAvail = (t) => t.available_seats ?? t.availableSeats ?? t.total_seats ?? t.totalSeats ?? 0;
const tripSeatsTotal = (t) => t.total_seats ?? t.totalSeats ?? 0;
const tripPrice = (t) => t.price_per_seat ?? t.pricePerSeat ?? 0;

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
      const { data } = await rideAPI.getMy();
      if (data.success) {
        setTrips(Array.isArray(data.data) ? data.data : data.data?.items || []);
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

  const handleStartTrip = async (tripId) => {
    try {
      await rideAPI.start(tripId);
      fetchTrips();
    } catch {
      // handle
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (!window.confirm('Cancel this trip?')) return;
    try {
      await rideAPI.cancel(tripId);
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
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>🚗</div>
          <h3>No trips posted yet</h3>
          <p>Share your journey and fill empty seats!</p>
          <Button onClick={() => navigate('/post-ride')} style={{ marginTop: 'var(--space-4)' }}>
            Post a Ride
          </Button>
        </div>
      ) : (
        <div className={styles.tripList}>
          {trips.map((trip, idx) => (
            <div key={trip.id} className={styles.tripCard} style={{ animationDelay: `${idx * 60}ms` }}>
              {/* Header: Route + Status */}
              <div className={styles.tripHeader}>
                <span className={styles.routeText}>
                  {tripOrigin(trip)} → {tripDest(trip)}
                </span>
                <Badge status={trip.status}>{(trip.status || 'active').replace('_', ' ')}</Badge>
              </div>

              {/* Metadata line */}
              <div className={styles.tripMeta}>
                <span>{formatDateSafe(tripDeparture(trip))}</span>
                <span>{tripSeatsAvail(trip)} seat{tripSeatsAvail(trip) !== 1 ? 's' : ''} available</span>
                <span>${tripPrice(trip)}/seat</span>
              </div>

              {/* Booking Requests */}
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

              {/* Action Buttons */}
              {(trip.status === 'active' || trip.status === 'in_progress' || trip.status === 'completed') && (
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
                  {(trip.status === 'active' || trip.status === 'in_progress') && (
                    <Button variant="danger" size="sm" onClick={() => handleCancelTrip(trip.id)}>
                      Cancel Trip
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
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
