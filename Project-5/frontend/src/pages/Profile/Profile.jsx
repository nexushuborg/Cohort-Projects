import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { driverAPI, extractError } from '../../services/api';
import { Input } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import Spinner from '../../components/Spinner/Spinner';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showDriverReg, setShowDriverReg] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState('');

  const [form, setForm] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchDriverProfile = async () => {
      setLoading(true);
      try {
        const { data } = await driverAPI.getMe();
        if (data.success) {
          setDriverProfile(data.data);
        }
      } catch {
        // Not a driver yet
      } finally {
        setLoading(false);
      }
    };
    fetchDriverProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    // Profile update would go to a backend endpoint
    // For now simulate update
    updateUser(form);
    setMessage('Profile updated successfully');
    setSaving(false);
  };

  const handleDriverRegister = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await driverAPI.register({ licenseNumber });
      if (data.success) {
        setDriverProfile(data.data);
        setShowDriverReg(false);
        setMessage('Driver profile created!');
      }
    } catch (err) {
      const extracted = extractError(err);
      setMessage(extracted.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className={styles.headerInfo}>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </div>
      </div>

      {message && (
        <div className={styles.section}>
          <Badge variant={message.includes('Failed') || message.includes('error') ? 'danger' : 'success'}>
            {message}
          </Badge>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Personal Information</h2>
        <form onSubmit={handleSave}>
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            helperText="Email cannot be changed"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
          <Button type="submit" loading={saving}>
            Save Changes
          </Button>
        </form>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Driver Status</h2>
        {loading ? (
          <Spinner />
        ) : driverProfile ? (
          <div>
            <div className={styles.driverBadge}>
              <Badge status={driverProfile.status}>
                {driverProfile.status?.replace('_', ' ').toUpperCase()}
              </Badge>
              <span>
                {driverProfile.isVerified ? 'Verified Driver' : 'Pending Verification'}
              </span>
            </div>
          </div>
        ) : showDriverReg ? (
          <form onSubmit={handleDriverRegister}>
            <Input
              label="License Number"
              name="licenseNumber"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g. DL-1234567890"
              required
            />
            <Button type="submit" loading={saving}>
              Register as Driver
            </Button>
          </form>
        ) : (
          <div>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Not registered as a driver yet? Start driving to earn.
            </p>
            <Button onClick={() => setShowDriverReg(true)}>
              Become a Driver
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
