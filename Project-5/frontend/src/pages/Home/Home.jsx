import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI, bookingAPI, recentSearchAPI, extractError } from '../../services/api';
import { Input } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import RoutePreview from '../../components/RoutePreview/RoutePreview';
import Badge from '../../components/Badge/Badge';
import Modal from '../../components/Modal/Modal';
import { Textarea } from '../../components/Input/Input';
import { useAuth } from '../../context/AuthContext';
import { formatDateSafe, formatCurrency } from '../../utils/format';
import styles from './Home.module.css';

// Helpers to safely resolve snake_case (PostgreSQL) or camelCase (JS) fields
const rideOrigin = (r) => r.origin_city || r.originCity || r.originAddress || 'Origin';
const rideDest = (r) => r.destination_city || r.destinationCity || r.destinationAddress || 'Destination';
const rideDeparture = (r) => r.departure_at || r.departureAt;
const rideSeats = (r) => r.available_seats ?? r.availableSeats ?? 0;
const ridePrice = (r) => r.price_per_seat ?? r.pricePerSeat ?? 0;

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    origin: '',
    destination: '',
    date: '',
    seats: '',
  });
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState('departure_at');

  // — Booking Modal State —
  const [bookingModal, setBookingModal] = useState({ open: false, ride: null });
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingMessage, setBookingMessage] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadRecentSearches();
    }
  }, [isAuthenticated]);

  const loadRecentSearches = async () => {
    try {
      const { data } = await recentSearchAPI.getMine();
      if (data.success) {
        setRecentSearches(data.data?.items || data.data || []);
      }
    } catch {
      // ignore
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const params = {};
      const trimmedOrigin = form.origin.trim();
      const trimmedDest = form.destination.trim();
      if (trimmedOrigin) params.origin = trimmedOrigin;
      if (trimmedDest) params.destination = trimmedDest;
      if (form.date) params.date = form.date;
      if (form.seats) params.seats = form.seats;
      params.sortBy = sortBy;
      params.order = sortBy === 'price_per_seat' ? 'asc' : 'asc';

      const { data } = await rideAPI.search(params);
      if (data.success) {
        setResults(data.data?.items || data.data || []);
      }

      if (isAuthenticated && trimmedOrigin && trimmedDest) {
        try {
          await recentSearchAPI.create({
            origin: trimmedOrigin,
            destination: trimmedDest,
            searchDate: form.date || undefined,
          });
          loadRecentSearches();
        } catch {
          // ignore
        }
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentChipClick = (search) => {
    setForm({
      origin: search.origin,
      destination: search.destination,
      date: search.search_date?.split('T')[0] || '',
      seats: '',
    });
    setTimeout(() => handleSearch(), 100);
  };

  const handleDeleteRecent = async (id, e) => {
    e.stopPropagation();
    try {
      await recentSearchAPI.delete(id);
      setRecentSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
  };

  // — Booking Handlers —
  const openBookingModal = (ride, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/' } } });
      return;
    }
    setBookingModal({ open: true, ride });
    setSeatsToBook(1);
    setBookingMessage('');
    setBookingError('');
    setBookingSuccess('');
  };

  const closeBookingModal = () => {
    setBookingModal({ open: false, ride: null });
    setBookingError('');
    setBookingSuccess('');
  };

  const handleBookingSubmit = async () => {
    const ride = bookingModal.ride;
    if (!ride) return;

    setSubmittingBooking(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      await bookingAPI.create({
        rideId: ride.id,
        seatsBooked: seatsToBook,
        message: bookingMessage || undefined,
      });
      setBookingSuccess('Booking request submitted successfully!');
      setTimeout(() => {
        closeBookingModal();
        navigate('/bookings');
      }, 1500);
    } catch (err) {
      const extracted = extractError(err);
      setBookingError(extracted.message);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'price_per_seat') return (ridePrice(a) || 0) - (ridePrice(b) || 0);
    return new Date(rideDeparture(a)) - new Date(rideDeparture(b));
  });

  const bookingRide = bookingModal.ride;
  const totalBookingPrice = bookingRide ? seatsToBook * ridePrice(bookingRide) : 0;

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Go anywhere with{' '}
            <span className={styles.heroHighlight}>Freebuff</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Find affordable rides heading your way. Search, book, and ride with verified drivers.
          </p>
        </div>
      </div>

      {/* Search Card */}
      <div className={styles.searchSection}>
        <div className={styles.searchCard}>
          <form onSubmit={handleSearch}>
            <div className={styles.searchRow}>
              <div className={styles.searchField}>
                <div className={styles.fieldIcon}>📍</div>
                <Input
                  label="From"
                  name="origin"
                  placeholder="Origin city"
                  value={form.origin}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.searchDivider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerDot} />
                <span className={styles.dividerLine} />
              </div>
              <div className={styles.searchField}>
                <div className={styles.fieldIcon}>🏁</div>
                <Input
                  label="To"
                  name="destination"
                  placeholder="Destination city"
                  value={form.destination}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.searchRowBottom}>
              <Input
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
              <Input
                label="Seats"
                name="seats"
                type="number"
                min="1"
                max="7"
                placeholder="1"
                value={form.seats}
                onChange={handleChange}
              />
              <div className={styles.searchBtnWrap}>
                <Button type="submit" fullWidth loading={loading} size="lg">
                  Search rides
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Searches */}
      {isAuthenticated && recentSearches.length > 0 && !searched && (
        <div className={styles.recentSection}>
          <span className={styles.recentLabel}>Recent searches</span>
          <div className={styles.recentChips}>
            {recentSearches.slice(0, 6).map((s) => (
              <button
                key={s.id}
                className={styles.chip}
                onClick={() => handleRecentChipClick(s)}
              >
                <span className={styles.chipRoute}>{s.origin} → {s.destination}</span>
                <span
                  className={styles.chipRemove}
                  onClick={(e) => handleDeleteRecent(s.id, e)}
                  role="button"
                  aria-label="Remove"
                >
                  ✕
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div className={styles.resultsSection}>
          <div className={styles.resultsHeader}>
            <div>
              <h2 className={styles.resultsTitle}>
                {loading ? 'Searching...' : `${sortedResults.length} ride${sortedResults.length !== 1 ? 's' : ''} found`}
              </h2>
              {!loading && sortedResults.length > 0 && (
                <p className={styles.resultsSub}>
                  {form.origin && form.destination
                    ? `${form.origin} → ${form.destination}`
                    : 'Showing all available rides'}
                </p>
              )}
            </div>
            {sortedResults.length > 1 && (
              <div className={styles.sortWrap}>
                <span className={styles.sortLabel}>Sort by</span>
                <select
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="departure_at">Departure time</option>
                  <option value="price_per_seat">Lowest price</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <Spinner />
          ) : sortedResults.length > 0 ? (
            <div className={styles.rideList}>
              {sortedResults.map((ride, index) => (
                <div
                  key={ride.id}
                  className={styles.rideCard}
                  onClick={() => navigate(`/rides/${ride.id}`)}
                  role="button"
                  tabIndex={0}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className={styles.rideMap}>
                    <RoutePreview
                      originLat={ride.origin_lat || ride.originLat}
                      originLng={ride.origin_lng || ride.originLng}
                      destinationLat={ride.destination_lat || ride.destinationLat}
                      destinationLng={ride.destination_lng || ride.destinationLng}
                      variant="card"
                    />
                  </div>
                  <div className={styles.rideCardBody}>
                    <div className={styles.rideInfo}>
                      <div className={styles.rideRoute}>
                        <span className={styles.routeFrom}>{rideOrigin(ride)}</span>
                        <span className={styles.routeArrow}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                        <span className={styles.routeTo}>{rideDest(ride)}</span>
                      </div>
                      <div className={styles.rideMeta}>
                        <span className={styles.metaItem}>
                          📅 {formatDateSafe(rideDeparture(ride))}
                        </span>
                        <span className={styles.metaItem}>
                          💺 {rideSeats(ride)} seat{rideSeats(ride) !== 1 ? 's' : ''} left
                        </span>
                      </div>
                      {ride.driver && (
                        <div className={styles.driverInfo}>
                          <div className={styles.driverAvatar}>
                            {ride.driver.name?.charAt(0)}
                          </div>
                          <span className={styles.driverName}>{ride.driver.name}</span>
                          <span className={styles.driverRating}>
                            ★ {ride.driver.avgRating || 'New'}
                          </span>
                          {ride.vehicle && (
                            <span className={styles.driverVehicle}>
                              · {ride.vehicle.make} {ride.vehicle.model}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={styles.ridePrice}>
                      <div className={styles.priceValue}>${ridePrice(ride)}</div>
                      <div className={styles.priceLabel}>per seat</div>
                      <button
                        className={styles.bookBtn}
                        onClick={(e) => openBookingModal(ride, e)}
                      >
                        Book Ride
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3 className={styles.emptyTitle}>No rides found</h3>
              <p className={styles.emptyText}>
                Try different search criteria or check back later for new rides.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModal.open}
        onClose={closeBookingModal}
        title="Book a Ride"
        footer={
          <>
            <Button variant="ghost" onClick={closeBookingModal}>Cancel</Button>
            <Button
              onClick={handleBookingSubmit}
              loading={submittingBooking}
              disabled={submittingBooking || !!bookingSuccess}
            >
              Confirm &amp; Book Ride
            </Button>
          </>
        }
      >
        {bookingRide && (
          <div className={styles.bookingModalBody}>
            {/* Ride summary */}
            <div className={styles.bookingSummary}>
              <span className={styles.bookingRoute}>
                {rideOrigin(bookingRide)} → {rideDest(bookingRide)}
              </span>
              <span className={styles.bookingDate}>
                {formatDateSafe(rideDeparture(bookingRide))}
              </span>
            </div>

            {/* Seats input */}
            <div className={styles.bookingField}>
              <label className={styles.bookingLabel}>Number of Seats</label>
              <input
                type="number"
                className={styles.bookingInput}
                min={1}
                max={rideSeats(bookingRide)}
                value={seatsToBook}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(rideSeats(bookingRide), parseInt(e.target.value, 10) || 1));
                  setSeatsToBook(val);
                }}
              />
              <span className={styles.bookingHint}>
                {rideSeats(bookingRide)} seat{rideSeats(bookingRide) !== 1 ? 's' : ''} available
              </span>
            </div>

            {/* Dynamic total */}
            <div className={styles.bookingTotal}>
              <span>Total</span>
              <span className={styles.bookingTotalValue}>${formatCurrency(totalBookingPrice)}</span>
            </div>

            {/* Message to driver */}
            <div className={styles.bookingField}>
              <label className={styles.bookingLabel}>Message to Driver (optional)</label>
              <textarea
                className={styles.bookingTextarea}
                placeholder="Hi, please confirm pickup spot."
                rows={3}
                value={bookingMessage}
                onChange={(e) => setBookingMessage(e.target.value)}
                maxLength={500}
              />
            </div>

            {/* Status messages */}
            {bookingError && (
              <div className={styles.bookingError}>{bookingError}</div>
            )}
            {bookingSuccess && (
              <div className={styles.bookingSuccess}>{bookingSuccess}</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
