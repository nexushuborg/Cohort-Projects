import styles from './Spinner.module.css';

const sizeMap = {
  sm: styles.spinnerSm,
  md: '',
  lg: styles.spinnerLg,
};

export default function Spinner({ size = 'md', inline = false, className = '' }) {
  if (inline) {
    return (
      <span
        className={[styles.spinner, styles.spinnerInline, sizeMap[size], className]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }

  return (
    <div className={[styles.spinnerContainer, className].filter(Boolean).join(' ')}>
      <div className={[styles.spinner, sizeMap[size]].filter(Boolean).join(' ')} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner} />
    </div>
  );
}
