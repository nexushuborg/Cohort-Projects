import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI, extractError } from '../../services/api';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import MapPicker from '../../components/MapPicker/MapPicker';
import styles from './PostRide.module.css';

export default function PostRide() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    originAddress: '',
    originCity: '',
    destinationAddress: '',
    destinationCity: '',
    departureDate: '',
    departureTime: '',
    totalSeats: '3',
    pricePerSeat: '',
    notes: '',
  });

  // Map coordinates — default to Mumbai / Pune
  const [originLat, setOriginLat] = useState(19.076);
  const [originLng, setOriginLng] = useState(72.8777);
  const [destLat, setDestLat] = useState(18.5204);
  const [destLng, setDestLng] = useState(73.8567);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOriginCoords = useCallback((lat, lng) => {
    setOriginLat(lat);
    setOriginLng(lng);
  }, []);

  const handleDestCoords = useCallback((lat, lng) => {
    setDestLat(lat);
    setDestLng(lng);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const departureAt = new Date(`${form.departureDate}T${form.departureTime}`).toISOString();

      const { data } = await rideAPI.create({
        originAddress: form.originAddress,
        originLat,
        originLng,
        originCity: form.originCity,
        destinationAddress: form.destinationAddress,
        destinationLat: destLat,
        destinationLng: destLng,
        destinationCity: form.destinationCity,
        departureAt,
        totalSeats: parseInt(form.totalSeats, 10),
        pricePerSeat: parseFloat(form.pricePerSeat),
        notes: form.notes || undefined,
      });

      if (data.success) {
        setMessage('Ride posted successfully!');
        setTimeout(() => navigate('/driver/trips'), 1500);
      }
    } catch (err) {
      const extracted = extractError(err);
      setError(extracted.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Post a Ride</h1>
        <p>Share your trip with riders going your way</p>
      </div>

      {message && <div className={styles.successMsg}>{message}</div>}
      {error && (
        <div style={{ padding: 'var(--space-4)', background: '#FDECEB', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          {error}
        </div>
      )}

      <div className={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {/* Map-based Location Picker */}
          <h3 className={styles.sectionTitle}>Route & Locations</h3>
          <MapPicker
            originLat={originLat}
            originLng={originLng}
            destLat={destLat}
            destLng={destLng}
            onOriginChange={handleOriginCoords}
            onDestChange={handleDestCoords}
          />

          {/* Origin details */}
          <h3 className={styles.sectionTitle}>Pickup Details</h3>
          <div className={styles.row}>
            <Input label="City" name="originCity" value={form.originCity} onChange={handleChange} placeholder="e.g. Mumbai" required />
            <Input label="Address" name="originAddress" value={form.originAddress} onChange={handleChange} placeholder="Full pickup address" required />
          </div>

          {/* Destination details */}
          <h3 className={styles.sectionTitle}>Drop-off Details</h3>
          <div className={styles.row}>
            <Input label="City" name="destinationCity" value={form.destinationCity} onChange={handleChange} placeholder="e.g. Pune" required />
            <Input label="Address" name="destinationAddress" value={form.destinationAddress} onChange={handleChange} placeholder="Full drop-off address" required />
          </div>

          {/* Trip details */}
          <h3 className={styles.sectionTitle}>Trip Details</h3>
          <div className={styles.row}>
            <Input label="Departure Date" name="departureDate" type="date" value={form.departureDate} onChange={handleChange} required />
            <Input label="Departure Time" name="departureTime" type="time" value={form.departureTime} onChange={handleChange} required />
          </div>
          <div className={styles.row}>
            <Input label="Total Seats" name="totalSeats" type="number" min="1" max="7" value={form.totalSeats} onChange={handleChange} required />
            <Input label="Price per Seat ($)" name="pricePerSeat" type="number" min="1" step="0.01" value={form.pricePerSeat} onChange={handleChange} required />
          </div>

          <Textarea
            label="Notes (optional)"
            name="notes"
            placeholder="Any additional info for riders (AC, luggage space, etc.)"
            value={form.notes}
            onChange={handleChange}
          />

          {/* Coordinates display */}
          <div className={styles.coordsDisplay}>
            <span>Pickup: {originLat.toFixed(4)}, {originLng.toFixed(4)}</span>
            <span>Drop-off: {destLat.toFixed(4)}, {destLng.toFixed(4)}</span>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Button type="submit" loading={saving}>Publish Ride</Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
