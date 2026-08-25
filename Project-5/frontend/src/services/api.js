import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ========================
// Error extraction helper
// ========================
// Backend returns:
//   { success: false, error: { code, message, details?: [{ field, message }] } }
// This helper normalizes any Axios/backend error into a consistent shape:
//   { message: string, code: string, fieldErrors: { [field]: string } }

export function extractError(err) {
  const data = err?.response?.data;

  // Backend-structured error
  if (data?.error) {
    const fieldErrors = {};
    if (Array.isArray(data.error.details)) {
      for (const detail of data.error.details) {
        fieldErrors[detail.field] = detail.message;
      }
    }
    return {
      message: data.error.message || 'An error occurred',
      code: data.error.code || 'UNKNOWN_ERROR',
      fieldErrors,
    };
  }

  // Axios network error / timeout
  if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
    return {
      message: 'Network error — please check your connection and try again.',
      code: 'NETWORK_ERROR',
      fieldErrors: {},
    };
  }

  // Fallback
  return {
    message: err?.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    fieldErrors: {},
  };
}

// ========================
// Axios instance
// ========================
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and attempt token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          if (data.success) {
            const { accessToken, refreshToken: newRefreshToken } = data.data;
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        // No refresh token — redirect to login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ========================
// Auth
// ========================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

// ========================
// Drivers
// ========================
export const driverAPI = {
  register: (data) => api.post('/drivers/register', data),
  getMe: () => api.get('/drivers/me'),
  updateStatus: (status) => api.put('/drivers/status', { status }),
  getPublic: (id) => api.get(`/drivers/${id}/public`),
};

// ========================
// Vehicles
// ========================
export const vehicleAPI = {
  create: (data) => api.post('/vehicles', data),
  getMine: () => api.get('/vehicles/me'),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// ========================
// Rides
// ========================
export const rideAPI = {
  create: (data) => api.post('/rides', data),
  getById: (id) => api.get(`/rides/${id}`),
  search: (params) => api.get('/rides/search', { params }),
};

// ========================
// Bookings
// ========================
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyRider: () => api.get('/bookings/my'),
  getMyDriver: () => api.get('/bookings/driver'),
  getById: (id) => api.get(`/bookings/${id}`),
  accept: (id) => api.post(`/bookings/${id}/accept`),
  decline: (id) => api.post(`/bookings/${id}/decline`),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  start: (id) => api.post(`/bookings/${id}/start`),
  complete: (id) => api.post(`/bookings/${id}/complete`),
};

// ========================
// Payments
// ========================
export const paymentAPI = {
  process: (data) => api.post('/payments/process', data),
  getHistory: () => api.get('/payments/history'),
  getByBooking: (bookingId) => api.get(`/payments/${bookingId}`),
};

// ========================
// Wallet
// ========================
export const walletAPI = {
  getBalance: () => api.get('/wallet'),
  topUp: (data) => api.post('/wallet/topup', data),
  withdraw: (data) => api.post('/wallet/withdraw', data),
  getTransactions: () => api.get('/wallet/transactions'),
};

// ========================
// Ratings
// ========================
export const ratingAPI = {
  create: (data) => api.post('/ratings', data),
  getUserRatings: (userId) => api.get(`/ratings/user/${userId}`),
  getRideRatings: (rideId) => api.get(`/ratings/ride/${rideId}`),
};

// ========================
// Recent Searches
// ========================
export const recentSearchAPI = {
  getMine: () => api.get('/recent-searches/me'),
  create: (data) => api.post('/recent-searches', data),
  delete: (id) => api.delete(`/recent-searches/${id}`),
};

// ========================
// Dashboards
// ========================
export const dashboardAPI = {
  getDriver: () => api.get('/dashboards/driver'),
  getRider: () => api.get('/dashboards/rider'),
  getAdmin: () => api.get('/dashboards/admin'),
};

export default api;
