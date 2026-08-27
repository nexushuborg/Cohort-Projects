import api from './api';

const productImageApi = {
  getProductImages(productId) {
    return api.get(`/products/${productId}/images`);
  },

  uploadProductImage(productId, file) {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  setPrimaryImage(productId, imageId) {
    return api.put(`/products/${productId}/images/${imageId}/primary`);
  },

  deleteProductImage(productId, imageId) {
    return api.delete(`/products/${productId}/images/${imageId}`);
  },
};

export default productImageApi;
