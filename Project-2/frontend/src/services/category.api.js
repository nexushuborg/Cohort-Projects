import api from './api';

const categoryApi = {
  getCategories(params) {
    return api.get('/categories', { params });
  },

  getCategory(id) {
    return api.get(`/categories/${id}`);
  },

  createCategory(data) {
    return api.post('/categories', data);
  },

  updateCategory(id, data) {
    return api.put(`/categories/${id}`, data);
  },

  deleteCategory(id) {
    return api.delete(`/categories/${id}`);
  },
};

export default categoryApi;
