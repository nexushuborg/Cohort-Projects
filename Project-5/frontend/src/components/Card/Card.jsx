import styles from './Card.module.css';

export function Card({
  children,
  className = '',
  hoverable = false,
  flat = false,
  padding = 'md',
  ...props
}) {
  const padClass = padding === 'none' ? styles.padNone : padding === 'lg' ? styles.padLg : '';
  return (
    <div
      className={[
        flat ? styles.cardFlat : styles.card,
        hoverable ? styles.cardHover : '',
        padClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={[styles.cardHeader, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={[styles.cardTitle, className].filter(Boolean).join(' ')}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className = '' }) {
  return (
    <div className={[styles.cardBody, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={[styles.cardFooter, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function StatsCard({ value, label, icon, trend, className = '' }) {
  return (
    <div className={[styles.statsCard, className].filter(Boolean).join(' ')}>
      {icon && <div className={styles.statsIcon}>{icon}</div>}
      <div className={styles.statsValue}>{value}</div>
      <div className={styles.statsLabel}>{label}</div>
      {trend && <div className={[styles.statsTrend, trend > 0 ? styles.trendUp : styles.trendDown].filter(Boolean).join(' ')}>{trend > 0 ? '+' : ''}{trend}%</div>}
    </div>
  );
}

export function MetricCard({ value, label, subtitle, icon, className = '' }) {
  return (
    <div className={[styles.metricCard, className].filter(Boolean).join(' ')}>
      <div className={styles.metricHeader}>
        {icon && <span className={styles.metricIcon}>{icon}</span>}
        <span className={styles.metricLabel}>{label}</span>
      </div>
      <div className={styles.metricValue}>{value}</div>
      {subtitle && <div className={styles.metricSubtitle}>{subtitle}</div>}
    </div>
  );
}
