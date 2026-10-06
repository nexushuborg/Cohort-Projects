import api from './api';

const userApi = {
  getProfile() {
    return api.get('/users/profile');
  },

  updateProfile(data) {
    return api.put('/users/profile', data);
  },

  changePassword(data) {
    return api.put('/users/password', data);
  },

  getUsers(params) {
    return api.get('/users', { params });
  },
};

export default userApi;
