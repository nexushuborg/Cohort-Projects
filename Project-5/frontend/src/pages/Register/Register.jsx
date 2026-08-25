import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import styles from './Register.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
    };
    if (form.phone.trim()) {
      payload.phone = form.phone.trim();
    }

    const result = await register(payload);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      {/* Branding Panel */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <div className={styles.brandLogo}>
            <span className={styles.brandIcon}>◆</span>
            Freebuff
          </div>
          <h1 className={styles.brandTitle}>
            Start your journey&nbsp;today.
          </h1>
          <p className={styles.brandSubtitle}>
            Join thousands of riders and drivers sharing rides across the country.
          </p>
          <div className={styles.brandStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>10K+</div>
              <div className={styles.statLabel}>Active Users</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>50K+</div>
              <div className={styles.statLabel}>Rides Shared</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>4.8</div>
              <div className={styles.statLabel}>Avg. Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>Create an account</h1>
            <p className={styles.subtitle}>Join Freebuff as a rider or driver</p>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              error={fieldErrors.name}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
              required
            />
            <Input
              label="Phone (optional)"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
            />
            <div className={styles.row}>
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={handleChange}
                error={fieldErrors.password}
                required
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg">
              Create account
            </Button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" className={styles.footerLink}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
