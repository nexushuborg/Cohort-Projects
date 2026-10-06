import api from './api';

const variantApi = {
  // Variant Types
  getVariants(productId) {
    return api.get(`/products/${productId}/variants`);
  },

  getVariant(productId, variantTypeId) {
    return api.get(`/products/${productId}/variants/${variantTypeId}`);
  },

  createVariant(productId, data) {
    return api.post(`/products/${productId}/variants`, data);
  },

  updateVariant(productId, variantTypeId, data) {
    return api.put(`/products/${productId}/variants/${variantTypeId}`, data);
  },

  deleteVariant(productId, variantTypeId) {
    return api.delete(`/products/${productId}/variants/${variantTypeId}`);
  },

  // Variant Options
  createVariantOption(productId, variantTypeId, data) {
    return api.post(`/products/${productId}/variants/${variantTypeId}/options`, data);
  },

  updateVariantOption(productId, variantTypeId, optionId, data) {
    return api.put(`/products/${productId}/variants/${variantTypeId}/options/${optionId}`, data);
  },

  deleteVariantOption(productId, variantTypeId, optionId) {
    return api.delete(`/products/${productId}/variants/${variantTypeId}/options/${optionId}`);
  },
};

export default variantApi;
