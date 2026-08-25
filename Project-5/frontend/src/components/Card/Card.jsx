import styles from './Card.module.css';

export function Card({
  children,
  className = '',
  hoverable = false,
  flat = false,
  ...props
}) {
  return (
    <div
      className={[
        flat ? styles.cardFlat : styles.card,
        hoverable ? styles.cardHover : '',
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

export function StatsCard({ value, label, className = '' }) {
  return (
    <div className={[styles.statsCard, className].filter(Boolean).join(' ')}>
      <div className={styles.statsValue}>{value}</div>
      <div className={styles.statsLabel}>{label}</div>
    </div>
  );
}
