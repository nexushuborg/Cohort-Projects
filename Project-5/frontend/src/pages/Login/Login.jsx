import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import styles from './Login.module.css';

export default function Login() {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
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
    setLoading(true);
    setError('');
    setFieldErrors({});

    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(from, { replace: true });
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
            Your ride, your&nbsp;way.
          </h1>
          <p className={styles.brandSubtitle}>
            Connect with drivers going your direction. Affordable, convenient, and community-powered.
          </p>
          <div className={styles.brandFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🚗</span>
              <span>Share rides and split costs</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔒</span>
              <span>Safe, verified drivers</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💰</span>
              <span>Earn while you drive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to continue to Freebuff</p>
          </div>

          {(error || authError) && (
            <div className={styles.errorBanner}>{error || authError}</div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
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
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              error={fieldErrors.password}
              required
            />
            <Button type="submit" fullWidth loading={loading} size="lg">
              Log in
            </Button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <p className={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.footerLink}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
