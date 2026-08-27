import api from './api';

const sellerApi = {
  registerStore(data) {
    return api.post('/sellers/register-store', data);
  },

  getStores(params) {
    return api.get('/sellers/stores', { params });
  },

  getStoreBySlug(slug) {
    return api.get(`/sellers/stores/${slug}`);
  },

  getMyStore() {
    return api.get('/sellers/stores/me/profile');
  },

  updateStore(id, data) {
    return api.put(`/sellers/stores/${id}`, data);
  },

  updateStoreStatus(id, data) {
    return api.patch(`/sellers/stores/${id}/status`, data);
  },
};

export default sellerApi;
