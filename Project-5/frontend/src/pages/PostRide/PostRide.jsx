import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideAPI, vehicleAPI, extractError } from '../../services/api';
import { Input, Textarea } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import MapPicker from '../../components/MapPicker/MapPicker';
import VehicleModal from '../../components/VehicleModal/VehicleModal';
import styles from './PostRide.module.css';

export default function PostRide() {
  const navigate = useNavigate();

  // — Vehicle state —
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // — Ride form state —
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

  // — Fetch active vehicle on mount —
  useEffect(() => {
    fetchVehicle();
  }, []);

  const fetchVehicle = async () => {
    setVehicleLoading(true);
    try {
      const { data } = await vehicleAPI.getMine();
      if (data.success) {
        const vehicles = Array.isArray(data.data) ? data.data : data.data ? [data.data] : [];
        const active = vehicles.find((v) => v.isActive === true || v.is_active === true);
        if (active) {
          setActiveVehicle(active);
        } else if (vehicles.length > 0) {
          // Has vehicles but none active — show modal to update
          setActiveVehicle(vehicles[0]);
          setShowVehicleModal(true);
        } else {
          // No vehicles at all — show modal to add one
          setActiveVehicle(null);
          setShowVehicleModal(true);
        }
      }
    } catch {
      // Not a driver yet or no vehicles — show modal
      setActiveVehicle(null);
      setShowVehicleModal(true);
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleVehicleSaved = (vehicle) => {
    setActiveVehicle(vehicle);
    setShowVehicleModal(false);
    // Update total seats from vehicle
    const seats = vehicle.seatCount || vehicle.seat_count || 4;
    setForm((prev) => ({ ...prev, totalSeats: String(seats) }));
  };

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

    // Guard: must have an active vehicle
    if (!activeVehicle) {
      setShowVehicleModal(true);
      return;
    }

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

  // — Vehicle info display —
  const vehicleLabel = activeVehicle
    ? `${activeVehicle.year || ''} ${activeVehicle.make || ''} ${activeVehicle.model || ''} · ${activeVehicle.color || ''} · ${activeVehicle.licensePlate || activeVehicle.license_plate || ''}`
    : '';

  const vehicleSeats = activeVehicle
    ? activeVehicle.seatCount || activeVehicle.seat_count
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Post a Ride</h1>
        <p>Share your trip with riders going your way</p>
      </div>

      {/* Vehicle warning banner */}
      {!vehicleLoading && !activeVehicle && (
        <div className={styles.vehicleBanner}>
          <div className={styles.vehicleBannerContent}>
            <span className={styles.vehicleBannerIcon}>🚗</span>
            <div className={styles.vehicleBannerText}>
              <strong>No active vehicle found.</strong>{' '}
              Please add your vehicle details to publish rides.
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowVehicleModal(true)}
          >
            Add Vehicle
          </Button>
        </div>
      )}

      {/* Vehicle info bar */}
      {!vehicleLoading && activeVehicle && (
        <div className={styles.vehicleBar}>
          <div className={styles.vehicleBarContent}>
            <span className={styles.vehicleBarIcon}>🚗</span>
            <div className={styles.vehicleBarInfo}>
              <span className={styles.vehicleBarLabel}>Your vehicle</span>
              <span className={styles.vehicleBarValue}>{vehicleLabel}</span>
            </div>
            {vehicleSeats && (
              <span className={styles.vehicleBarSeats}>{vehicleSeats} seats</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowVehicleModal(true)}
          >
            Change
          </Button>
        </div>
      )}

      {message && <div className={styles.successMsg}>{message}</div>}
      {error && (
        <div className={styles.errorMsg}>{error}</div>
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
            <Input
              label="City"
              name="originCity"
              value={form.originCity}
              onChange={handleChange}
              placeholder="e.g. Mumbai"
              required
            />
            <Input
              label="Address"
              name="originAddress"
              value={form.originAddress}
              onChange={handleChange}
              placeholder="Full pickup address"
              required
            />
          </div>

          {/* Destination details */}
          <h3 className={styles.sectionTitle}>Drop-off Details</h3>
          <div className={styles.row}>
            <Input
              label="City"
              name="destinationCity"
              value={form.destinationCity}
              onChange={handleChange}
              placeholder="e.g. Pune"
              required
            />
            <Input
              label="Address"
              name="destinationAddress"
              value={form.destinationAddress}
              onChange={handleChange}
              placeholder="Full drop-off address"
              required
            />
          </div>

          {/* Trip details */}
          <h3 className={styles.sectionTitle}>Trip Details</h3>
          <div className={styles.row}>
            <Input
              label="Departure Date"
              name="departureDate"
              type="date"
              value={form.departureDate}
              onChange={handleChange}
              required
            />
            <Input
              label="Departure Time"
              name="departureTime"
              type="time"
              value={form.departureTime}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.row}>
            <Input
              label="Available Seats"
              name="totalSeats"
              type="number"
              min="1"
              max={vehicleSeats || 7}
              value={form.totalSeats}
              onChange={handleChange}
              helperText={vehicleSeats ? `Your vehicle has ${vehicleSeats} seats` : undefined}
              required
            />
            <Input
              label="Price per Seat ($)"
              name="pricePerSeat"
              type="number"
              min="1"
              step="0.01"
              value={form.pricePerSeat}
              onChange={handleChange}
              required
            />
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

          <div className={styles.formActions}>
            <Button
              type="submit"
              loading={saving}
              disabled={!activeVehicle}
            >
              {activeVehicle ? 'Publish Ride' : 'Add Vehicle First'}
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Vehicle Modal */}
      <VehicleModal
        isOpen={showVehicleModal}
        onClose={() => {
          // Only close if there's a vehicle; otherwise they must add one
          if (activeVehicle) setShowVehicleModal(false);
        }}
        existingVehicle={activeVehicle}
        onSaved={handleVehicleSaved}
      />
    </div>
  );
}
