import api from './api';

const productApi = {
  getProducts(params) {
    return api.get('/products', { params });
  },

  getProduct(id) {
    return api.get(`/products/${id}`);
  },

  getProductsByStore(storeId, params) {
    return api.get(`/products/store/${storeId}`, { params });
  },

  createProduct(data) {
    return api.post('/products', data);
  },

  updateProduct(id, data) {
    return api.put(`/products/${id}`, data);
  },

  deleteProduct(id) {
    return api.delete(`/products/${id}`);
  },
};

export default productApi;
