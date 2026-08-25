import styles from './Button.module.css';

const variantMap = {
  primary: styles.btnPrimary,
  secondary: styles.btnSecondary,
  danger: styles.btnDanger,
  success: styles.btnSuccess,
  ghost: styles.btnGhost,
  outline: styles.btnOutline,
};

const sizeMap = {
  xs: styles.btnXs,
  sm: styles.btnSm,
  md: '',
  lg: styles.btnLg,
  xl: styles.btnXl,
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  icon,
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        styles.btn,
        variantMap[variant] || styles.btnPrimary,
        sizeMap[size] || '',
        fullWidth ? styles.btnFull : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span className={styles.spinnerWrap}>
          <span className={styles.spinner} />
        </span>
      )}
      {!loading && icon && <span className={styles.icon}>{icon}</span>}
      <span className={loading ? styles.loadingText : ''}>{children}</span>
    </button>
  );
}
