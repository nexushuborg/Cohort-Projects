import { useState, useEffect } from 'react';
import { vehicleAPI, extractError } from '../../services/api';
import { Input } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import Spinner from '../../components/Spinner/Spinner';
import styles from './DriverSetup.module.css';

export default function DriverSetup() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    seatCount: '4',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await vehicleAPI.getMine();
      if (data.success) {
        setVehicles(Array.isArray(data.data) ? data.data : data.data ? [data.data] : []);
      }
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const { data } = await vehicleAPI.create({
        ...form,
        year: parseInt(form.year, 10),
        seatCount: parseInt(form.seatCount, 10),
      });
      if (data.success) {
        setMessage('Vehicle added successfully!');
        setShowForm(false);
        setForm({ make: '', model: '', year: '', color: '', licensePlate: '', seatCount: '4' });
        fetchVehicles();
      }
    } catch (err) {
      const extracted = extractError(err);
      setMessage(extracted.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await vehicleAPI.delete(id);
      fetchVehicles();
    } catch {
      // handle error
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Vehicle Management</h1>
        <p>Add and manage your vehicles for ride-sharing</p>
      </div>

      {message && (
        <div className={styles.successMsg}>{message}</div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          {vehicles.length > 0 && (
            <div className={styles.vehicleList}>
              {vehicles.map((v) => (
                <div key={v.id} className={styles.vehicleCard}>
                  <div className={styles.vehicleInfo}>
                    <h3>{v.year} {v.make} {v.model}</h3>
                    <p>{v.color} &middot; {v.licensePlate} &middot; {v.seatCount} seats</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <Badge variant={v.isActive ? 'success' : 'default'}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showForm ? (
            <div className={styles.formCard} style={{ marginTop: 'var(--space-6)' }}>
              <h3 className={styles.formTitle}>Add New Vehicle</h3>
              <form onSubmit={handleSubmit}>
                <div className={styles.row}>
                  <Input label="Make" name="make" value={form.make} onChange={handleChange} placeholder="e.g. Toyota" required />
                  <Input label="Model" name="model" value={form.model} onChange={handleChange} placeholder="e.g. Corolla" required />
                </div>
                <div className={styles.row}>
                  <Input label="Year" name="year" type="number" value={form.year} onChange={handleChange} placeholder="2022" required />
                  <Input label="Color" name="color" value={form.color} onChange={handleChange} placeholder="White" required />
                </div>
                <div className={styles.row}>
                  <Input label="License Plate" name="licensePlate" value={form.licensePlate} onChange={handleChange} placeholder="MH-02-AB-1234" required />
                  <Input label="Seat Count" name="seatCount" type="number" min="2" max="8" value={form.seatCount} onChange={handleChange} required />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                  <Button type="submit" loading={saving}>Add Vehicle</Button>
                  <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button onClick={() => setShowForm(true)}>Add Vehicle</Button>
            </div>
          )}

          {vehicles.length === 0 && !showForm && (
            <div className={styles.emptyState}>
              <p>No vehicles added yet. Add your first vehicle to start driving.</p>
              <Button onClick={() => setShowForm(true)}>Add Your First Vehicle</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
