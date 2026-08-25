import styles from './Input.module.css';

export function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  required,
  disabled,
  className = '',
  ...props
}) {
  return (
    <div className={[styles.group, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={[styles.input, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
      {helperText && !error && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
  error,
  required,
  disabled,
  className = '',
  ...props
}) {
  return (
    <div className={[styles.group, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={[styles.select, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export function Textarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  rows = 4,
  required,
  disabled,
  className = '',
  ...props
}) {
  return (
    <div className={[styles.group, className].filter(Boolean).join(' ')}>
      {label && (
        <label className={styles.label} htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        disabled={disabled}
        className={[styles.textarea, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
