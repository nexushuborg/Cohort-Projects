import api from './api';

const cartApi = {
  getCart() {
    return api.get('/cart');
  },

  addCartItem(data) {
    return api.post('/cart/items', data);
  },

  updateCartItem(id, data) {
    return api.put(`/cart/items/${id}`, data);
  },

  removeCartItem(id) {
    return api.delete(`/cart/items/${id}`);
  },

  clearCart() {
    return api.delete('/cart');
  },
};

export default cartApi;
