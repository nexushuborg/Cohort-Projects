import api from './api';

const skuApi = {
  getSkus(productId) {
    return api.get(`/products/${productId}/skus`);
  },

  getSku(productId, skuId) {
    return api.get(`/products/${productId}/skus/${skuId}`);
  },

  createSku(productId, data) {
    return api.post(`/products/${productId}/skus`, data);
  },

  updateSku(productId, skuId, data) {
    return api.put(`/products/${productId}/skus/${skuId}`, data);
  },

  deleteSku(productId, skuId) {
    return api.delete(`/products/${productId}/skus/${skuId}`);
  },
};

export default skuApi;
