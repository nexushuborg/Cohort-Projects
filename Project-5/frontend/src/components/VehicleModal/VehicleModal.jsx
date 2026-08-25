import { useState } from 'react';
import { Input, Select } from '../Input/Input';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { vehicleAPI, extractError } from '../../services/api';
import styles from './VehicleModal.module.css';

const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - 1999 },
  (_, i) => ({
    value: String(new Date().getFullYear() - i),
    label: String(new Date().getFullYear() - i),
  })
);

const SEAT_OPTIONS = Array.from({ length: 7 }, (_, i) => ({
  value: String(i + 2),
  label: `${i + 2} seats`,
}));

export default function VehicleModal({ isOpen, onClose, existingVehicle, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const isUpdate = !!existingVehicle;

  const [form, setForm] = useState(() => ({
    make: existingVehicle?.make || '',
    model: existingVehicle?.model || '',
    year: existingVehicle?.year ? String(existingVehicle.year) : '',
    color: existingVehicle?.color || '',
    licensePlate: existingVehicle?.licensePlate || existingVehicle?.license_plate || '',
    seatCount: existingVehicle?.seatCount
      ? String(existingVehicle.seatCount)
      : existingVehicle?.seat_count
        ? String(existingVehicle.seat_count)
        : '4',
  }));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    try {
      const payload = {
        make: form.make.trim(),
        model: form.model.trim(),
        year: parseInt(form.year, 10),
        color: form.color.trim(),
        licensePlate: form.licensePlate.trim(),
        seatCount: parseInt(form.seatCount, 10),
      };

      let res;
      if (isUpdate) {
        res = await vehicleAPI.update(existingVehicle.id, payload);
      } else {
        res = await vehicleAPI.create(payload);
      }

      if (res.data.success) {
        onSaved(res.data.data);
      }
    } catch (err) {
      const extracted = extractError(err);
      setError(extracted.message);
      if (extracted.fieldErrors) {
        setFieldErrors(extracted.fieldErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    // Don't close if there's no vehicle — they must complete this
    if (!existingVehicle) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleBackdropClick}
      title={isUpdate ? 'Update Vehicle Details' : 'Add Your Vehicle'}
      size="lg"
      footer={
        existingVehicle ? (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={saving}>
              Save Changes
            </Button>
          </>
        ) : (
          <Button onClick={handleSubmit} loading={saving} fullWidth>
            Save Vehicle & Continue
          </Button>
        )
      }
    >
      {!existingVehicle && (
        <p className={styles.modalHint}>
          You need an active vehicle to publish rides. Add your vehicle details below to get started.
        </p>
      )}

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <Input
            label="Make"
            name="make"
            placeholder="e.g. Toyota"
            value={form.make}
            onChange={handleChange}
            error={fieldErrors.make}
            required
          />
          <Input
            label="Model"
            name="model"
            placeholder="e.g. Corolla"
            value={form.model}
            onChange={handleChange}
            error={fieldErrors.model}
            required
          />
        </div>

        <div className={styles.row}>
          <Select
            label="Year"
            name="year"
            value={form.year}
            onChange={handleChange}
            options={YEAR_OPTIONS}
            placeholder="Select year"
            error={fieldErrors.year}
            required
          />
          <Input
            label="Color"
            name="color"
            placeholder="e.g. White"
            value={form.color}
            onChange={handleChange}
            error={fieldErrors.color}
            required
          />
        </div>

        <div className={styles.row}>
          <Input
            label="License Plate"
            name="licensePlate"
            placeholder="e.g. OD-02-AB-1234"
            value={form.licensePlate}
            onChange={handleChange}
            error={fieldErrors.licensePlate}
            required
          />
          <Select
            label="Seat Count"
            name="seatCount"
            value={form.seatCount}
            onChange={handleChange}
            options={SEAT_OPTIONS}
            error={fieldErrors.seatCount}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
