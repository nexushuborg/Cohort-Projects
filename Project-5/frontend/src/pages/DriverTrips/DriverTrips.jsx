import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI, bookingAPI, ratingAPI } from '../../services/api';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import Spinner from '../../components/Spinner/Spinner';
import { Textarea } from '../../components/Input/Input';
import { formatDateSafe, formatRupees } from '../../utils/format';
import styles from './DriverTrips.module.css';

// Helpers to safely resolve snake_case (PostgreSQL) or camelCase (JS) fields
const tripOrigin = (t) => t.origin_city || t.originCity || 'Origin';
const tripDest = (t) => t.destination_city || t.destinationCity || 'Destination';
const tripDeparture = (t) => t.departure_at || t.departureAt;
const tripSeatsAvail = (t) => t.available_seats ?? t.availableSeats ?? t.total_seats ?? t.totalSeats ?? 0;
const tripSeatsTotal = (t) => t.total_seats ?? t.totalSeats ?? 0;
const tripPrice = (t) => t.price_per_seat ?? t.pricePerSeat ?? 0;

// Booking field accessors
const bkRiderName = (b) => b.rider_name || b.riderName || b.rider?.name || 'Rider';
const bkOrigin = (b) => b.origin_city || b.originCity || b.ride?.origin_city || b.ride?.originCity || 'Origin';
const bkDest = (b) => b.destination_city || b.destinationCity || b.ride?.destination_city || b.ride?.destinationCity || 'Destination';
const bkSeats = (b) => b.seats_booked ?? b.seatsBooked ?? 1;
const bkAmount = (b) => b.total_amount ?? b.totalAmount ?? b.amount ?? 0;

export default function DriverTrips() {
  const navigate = useNavigate();

  // — Trips State —
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // — Booking Requests State —
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingTab, setBookingTab] = useState('requested');

  // — Rating Modal State —
  const [ratingModal, setRatingModal] = useState({ open: false, booking: null });
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingText, setRatingText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchTrips();
    fetchBookings();
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

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const { data } = await bookingAPI.getMyDriver();
      if (data.success) {
        setBookings(Array.isArray(data.data) ? data.data : data.data?.items || []);
      }
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await bookingAPI.accept(bookingId);
      fetchBookings();
      fetchTrips();
    } catch {
      // handle
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    try {
      await bookingAPI.decline(bookingId);
      fetchBookings();
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
      fetchBookings();
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

  // Filter bookings by tab
  const filteredBookings = bookings.filter((b) => {
    if (bookingTab === 'requested') return b.status === 'requested';
    if (bookingTab === 'accepted') return b.status === 'accepted';
    if (bookingTab === 'completed') return b.status === 'completed' || b.status === 'declined';
    return true;
  });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>My Trips</h1>
        <Button onClick={() => navigate('/post-ride')}>Post New Ride</Button>
      </div>

      {/* Trips Section */}
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
                <span>{formatRupees(tripPrice(trip))}/seat</span>
              </div>

              {/* Inline Booking Requests on this trip */}
              {trip.bookings && trip.bookings.length > 0 && (
                <div className={styles.bookingsSection}>
                  <div className={styles.bookingsTitle}>Booking Requests</div>
                  {trip.bookings.map((booking) => (
                    <div key={booking.id} className={styles.bookingRequest}>
                      <div>
                        <div className={styles.bookingRider}>{bkRiderName(booking)}</div>
                        <div className={styles.bookingInfo}>
                          {bkSeats(booking)} seat(s) · {formatRupees(bkAmount(booking))} ·{' '}
                          <Badge status={booking.status} variant="info">{booking.status}</Badge>
                        </div>
                        {booking.message && (
                          <div className={styles.bookingMessage}>"{booking.message}"</div>
                        )}
                      </div>
                      {booking.status === 'requested' && (
                        <div className={styles.bookingActions}>
                          <Button size="sm" onClick={() => handleAcceptBooking(booking.id)}>Accept</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeclineBooking(booking.id)}>Decline</Button>
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

      {/* ============================== */}
      {/* Booking Requests Panel         */}
      {/* ============================== */}
      <div style={{ marginTop: 'var(--space-10)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          Booking Requests
        </h2>

        {/* Tabs */}
        <div className={styles.tabs}>
          {[
            { key: 'requested', label: 'Pending' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'completed', label: 'Completed / Declined' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={[styles.tab, bookingTab === tab.key ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setBookingTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {bookingsLoading ? (
          <Spinner />
        ) : filteredBookings.length === 0 ? (
          <div className={styles.emptyBookings}>
            <p>No {bookingTab === 'requested' ? 'pending' : bookingTab} requests yet.</p>
          </div>
        ) : (
          <div className={styles.bookingList}>
            {filteredBookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingCardHeader}>
                  <div className={styles.bookingCardRider}>
                    <div className={styles.riderAvatar}>{bkRiderName(booking).charAt(0)}</div>
                    <div>
                      <div className={styles.riderName}>{bkRiderName(booking)}</div>
                      <div className={styles.riderRoute}>{bkOrigin(booking)} → {bkDest(booking)}</div>
                    </div>
                  </div>
                  <Badge status={booking.status}>{booking.status}</Badge>
                </div>

                <div className={styles.bookingCardBody}>
                  <span>{bkSeats(booking)} seat(s) requested</span>
                  <span>{formatRupees(bkAmount(booking))}</span>
                  {booking.ride?.departure_at || booking.ride?.departureAt ? (
                    <span>{formatDateSafe(booking.ride?.departure_at || booking.ride?.departureAt)}</span>
                  ) : null}
                </div>

                {booking.message && (
                  <div className={styles.bookingCardMessage}>"{booking.message}"</div>
                )}

                {booking.status === 'requested' && (
                  <div className={styles.bookingCardActions}>
                    <Button size="sm" onClick={() => handleAcceptBooking(booking.id)}>Accept</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeclineBooking(booking.id)}>Decline</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
