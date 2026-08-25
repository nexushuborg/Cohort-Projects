import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { rideAPI, recentSearchAPI } from '../../services/api';
import { Input } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import RoutePreview from '../../components/RoutePreview/RoutePreview';
import Badge from '../../components/Badge/Badge';
import { useAuth } from '../../context/AuthContext';
import styles from './Home.module.css';

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
      if (form.origin) params.origin = form.origin;
      if (form.destination) params.destination = form.destination;
      if (form.date) params.date = form.date;
      if (form.seats) params.seats = form.seats;
      params.sortBy = sortBy;
      params.order = sortBy === 'price_per_seat' ? 'asc' : 'asc';

      const { data } = await rideAPI.search(params);
      if (data.success) {
        setResults(data.data?.items || data.data || []);
      }

      if (isAuthenticated && form.origin && form.destination) {
        try {
          await recentSearchAPI.create({
            origin: form.origin,
            destination: form.destination,
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

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'price_per_seat') return (a.pricePerSeat || 0) - (b.pricePerSeat || 0);
    return new Date(a.departureAt) - new Date(b.departureAt);
  });

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
                      originLat={ride.originLat}
                      originLng={ride.originLng}
                      destinationLat={ride.destinationLat}
                      destinationLng={ride.destinationLng}
                      variant="card"
                    />
                  </div>
                  <div className={styles.rideCardBody}>
                    <div className={styles.rideInfo}>
                      <div className={styles.rideRoute}>
                        <span className={styles.routeFrom}>{ride.originCity || ride.originAddress}</span>
                        <span className={styles.routeArrow}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                        <span className={styles.routeTo}>{ride.destinationCity || ride.destinationAddress}</span>
                      </div>
                      <div className={styles.rideMeta}>
                        <span className={styles.metaItem}>
                          📅 {format(new Date(ride.departureAt), 'MMM d, h:mm a')}
                        </span>
                        <span className={styles.metaItem}>
                          💺 {ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''} left
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
                      <div className={styles.priceValue}>${ride.pricePerSeat}</div>
                      <div className={styles.priceLabel}>per seat</div>
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
    </div>
  );
}
