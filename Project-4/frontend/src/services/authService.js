import api from './api';

export const authService = {
  login: async (credentials) => api.post('/auth/login', credentials),
  register: async (userData) => api.post('/auth/register', userData),
  getProfile: async () => api.get('/auth/profile'),
  updateProfile: async (profileData) => api.put('/auth/profile', profileData),
  resetPassword: async (passwordData) => api.post('/auth/reset-password', passwordData),
};