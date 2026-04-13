import client from '../http/client';

export const cartApi = {
  getCart: () => client.get('/cart'),
  addToCart: (payload) => client.post('/cart', payload),
  updateItem: (payload) => client.patch('/cart/update-item', payload),
  removeItem: (itemId) => client.delete(`/cart/remove-item/${itemId}`),
  clearCart: () => client.delete('/cart'),
};
