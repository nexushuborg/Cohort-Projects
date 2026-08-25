import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { bookingAPI, ratingAPI } from '../../services/api';
import Badge from '../../components/Badge/Badge';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import { Textarea } from '../../components/Input/Input';
import Spinner from '../../components/Spinner/Spinner';
import styles from './MyBookings.module.css';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [ratingModal, setRatingModal] = useState({ open: false, booking: null });
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingText, setRatingText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.getMyRider();
      if (data.success) {
        setBookings(data.data?.items || data.data || []);
      }
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
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
        rideId: ratingModal.booking.rideId || ratingModal.booking.ride?.id,
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

  const filtered = activeTab === 'all'
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  return (
    <div className={styles.container}>
      <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: 'var(--space-6)' }}>My Bookings</h1>

      <div className={styles.tabs}>
        {[
          { key: 'all', label: 'All' },
          { key: 'requested', label: 'Pending' },
          { key: 'accepted', label: 'Accepted' },
          { key: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={[styles.tab, activeTab === tab.key ? styles.tabActive : ''].filter(Boolean).join(' ')}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No bookings yet</h3>
          <p>Search for rides to get started.</p>
          <Button onClick={() => navigate('/search')} style={{ marginTop: 'var(--space-4)' }}>
            Find Rides
          </Button>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {filtered.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <span className={styles.routeText}>
                  {booking.ride?.originCity || 'Origin'} → {booking.ride?.destinationCity || 'Dest'}
                </span>
                <Badge status={booking.status}>{booking.status}</Badge>
              </div>
              <div className={styles.bookingMeta}>
                {booking.ride?.departureAt && (
                  <span>{format(new Date(booking.ride.departureAt), 'MMM d, h:mm a')}</span>
                )}
                <span>{booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
                <span>${booking.totalAmount}</span>
              </div>
              <div className={styles.bookingFooter}>
                {booking.status === 'requested' && (
                  <Button variant="danger" size="sm" onClick={() => handleCancel(booking.id)}>
                    Cancel
                  </Button>
                )}
                {booking.status === 'completed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setRatingModal({ open: true, booking })}
                  >
                    Rate Trip
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
        title="Rate Your Trip"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRatingModal({ open: false, booking: null })}>Skip</Button>
            <Button onClick={handleRate} loading={submittingRating} disabled={ratingValue === 0}>Submit Rating</Button>
          </>
        }
      >
        <div className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={[styles.star, star <= ratingValue ? styles.starFilled : ''].filter(Boolean).join(' ')}
              onClick={() => setRatingValue(star)}
            >
              ★
            </span>
          ))}
        </div>
        <Textarea
          label="Leave a review (optional)"
          name="review"
          placeholder="How was your trip?"
          value={ratingText}
          onChange={(e) => setRatingText(e.target.value)}
          rows={3}
        />
      </Modal>
    </div>
  );
}
