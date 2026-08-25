import styles from './Button.module.css';

const variantMap = {
  primary: styles.btnPrimary,
  secondary: styles.btnSecondary,
  danger: styles.btnDanger,
  success: styles.btnSuccess,
  ghost: styles.btnGhost,
};

const sizeMap = {
  sm: styles.btnSm,
  md: '',
  lg: styles.btnLg,
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        variantMap[variant] || styles.btnPrimary,
        sizeMap[size] || '',
        fullWidth ? styles.btnFull : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
