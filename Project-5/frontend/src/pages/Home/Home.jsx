import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { rideAPI, recentSearchAPI } from '../../services/api';
import { Input } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import RoutePreview from '../../components/RoutePreview/RoutePreview';
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

      // Save recent search
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
    // Auto-search
    setTimeout(() => {
      handleSearch();
    }, 100);
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
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>Find your next ride</h1>
        <p>Affordable, shared rides at your fingertips</p>
      </div>

      <div className={styles.searchCard}>
        <form onSubmit={handleSearch}>
          <div className={styles.searchRow}>
            <Input
              label="From"
              name="origin"
              placeholder="Origin city"
              value={form.origin}
              onChange={handleChange}
            />
            <Input
              label="To"
              name="destination"
              placeholder="Destination city"
              value={form.destination}
              onChange={handleChange}
            />
          </div>
          <div className={styles.searchRow3}>
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
            <Input
              label="Seats needed"
              name="seats"
              type="number"
              min="1"
              max="7"
              placeholder="1"
              value={form.seats}
              onChange={handleChange}
            />
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button type="submit" fullWidth loading={loading}>
                Search
              </Button>
            </div>
          </div>
        </form>
      </div>

      {isAuthenticated && recentSearches.length > 0 && !searched && (
        <div>
          <span className={styles.recentLabel}>Recent searches</span>
          <div className={styles.recentChips}>
            {recentSearches.slice(0, 6).map((s) => (
              <button
                key={s.id}
                className={styles.chip}
                onClick={() => handleRecentChipClick(s)}
              >
                {s.origin} → {s.destination}
                <span
                  className={styles.chipRemove}
                  onClick={(e) => handleDeleteRecent(s.id, e)}
                  role="button"
                >
                  ✕
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {searched && (
        <>
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>
              {loading ? 'Searching...' : `${sortedResults.length} ride${sortedResults.length !== 1 ? 's' : ''} found`}
            </h2>
            {sortedResults.length > 1 && (
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="departure_at">Sort by Departure</option>
                <option value="price_per_seat">Sort by Price</option>
              </select>
            )}
          </div>

          {loading ? (
            <Spinner />
          ) : sortedResults.length > 0 ? (
            <div className={styles.rideList}>
              {sortedResults.map((ride) => (
                <div
                  key={ride.id}
                  className={styles.rideCard}
                  onClick={() => navigate(`/rides/${ride.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <RoutePreview
                    originLat={ride.originLat}
                    originLng={ride.originLng}
                    destinationLat={ride.destinationLat}
                    destinationLng={ride.destinationLng}
                    variant="card"
                  />
                  <div className={styles.rideCardBody}>
                    <div>
                      <div className={styles.rideRoute}>
                        <span className={styles.routeFrom}>{ride.originCity || ride.originAddress}</span>
                        <span className={styles.routeArrow}>→</span>
                        <span className={styles.routeTo}>{ride.destinationCity || ride.destinationAddress}</span>
                      </div>
                      <div className={styles.rideMeta}>
                        <span>{format(new Date(ride.departureAt), 'MMM d, h:mm a')}</span>
                        <span>{ride.availableSeats} seat{ride.availableSeats !== 1 ? 's' : ''} left</span>
                      </div>
                      {ride.driver && (
                        <div className={styles.driverInfo}>
                          {ride.driver.name} &middot; ★ {ride.driver.avgRating || 'New'}
                          {ride.vehicle && ` · ${ride.vehicle.make} ${ride.vehicle.model}`}
                        </div>
                      )}
                    </div>
                    <div className={styles.ridePrice}>
                      <div className={styles.ridePriceValue}>${ride.pricePerSeat}</div>
                      <div className={styles.ridePriceLabel}>per seat</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>No rides found</h3>
              <p>Try different search criteria or check back later.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
