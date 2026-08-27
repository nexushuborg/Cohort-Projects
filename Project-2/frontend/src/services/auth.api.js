import api from './api';

const authApi = {
  register(data) {
    return api.post('/auth/register', data);
  },

  login(data) {
    return api.post('/auth/login', data);
  },

  refreshToken(refreshToken) {
    return api.post('/auth/refresh-token', { refreshToken });
  },

  logout() {
    return api.post('/auth/logout');
  },

  getCurrentUser() {
    return api.get('/auth/me');
  },
};

export default authApi;
