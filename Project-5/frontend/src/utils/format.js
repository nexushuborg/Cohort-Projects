import { format, formatDistanceToNow, isValid } from 'date-fns';

/**
 * Safely format a date value. Returns fallback string if date is null/undefined/invalid.
 */
export const formatDateSafe = (dateVal, formatStr = 'MMM d, h:mm a') => {
  if (!dateVal) return 'Date N/A';
  const parsed = new Date(dateVal);
  return isValid(parsed) ? format(parsed, formatStr) : 'Date N/A';
};

/**
 * Safely compute a relative time distance. Returns empty string if date is invalid.
 */
export const formatDistanceSafe = (dateVal) => {
  if (!dateVal) return '';
  const parsed = new Date(dateVal);
  return isValid(parsed) ? formatDistanceToNow(parsed, { addSuffix: true }) : '';
};

/**
 * Safely format a monetary value to 2 decimal places. Handles strings, null, NaN.
 */
export const formatCurrency = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};
