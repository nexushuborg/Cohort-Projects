import api from './api';

const inventoryApi = {
  getInventory(productId) {
    return api.get(`/products/${productId}/inventory`);
  },

  getInventoryItem(productId, skuId) {
    return api.get(`/products/${productId}/inventory/${skuId}`);
  },

  setInventory(productId, skuId, data) {
    return api.put(`/products/${productId}/inventory/${skuId}`, data);
  },

  adjustInventory(productId, skuId, data) {
    return api.patch(`/products/${productId}/inventory/${skuId}`, data);
  },
};

export default inventoryApi;
