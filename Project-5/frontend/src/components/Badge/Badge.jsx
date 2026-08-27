import styles from './Badge.module.css';

const variantMap = {
  default: styles.badgeDefault,
  success: styles.badgeSuccess,
  danger: styles.badgeDanger,
  warning: styles.badgeWarning,
  info: styles.badgeInfo,
};

// Map status strings to badge variants
const statusVariantMap = {
  // Booking statuses
  requested: 'warning',
  accepted: 'success',
  declined: 'danger',
  cancelled: 'danger',
  completed: 'success',
  // Ride statuses
  active: 'info',
  full: 'warning',
  in_progress: 'info',
  // Driver statuses
  offline: 'default',
  online: 'success',
  on_trip: 'info',
  // Payment
  pending: 'warning',
  failed: 'danger',
  refunded: 'info',
};

export default function Badge({ children, variant, status, className = '' }) {
  const resolvedVariant =
    variant || (status ? statusVariantMap[status] || 'default' : 'default');

  return (
    <span
      className={[styles.badge, variantMap[resolvedVariant] || styles.badgeDefault, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
