import client from '../http/client';

export const wishlistApi = {
  get: () => client.get('/wishlist'),
  add: (productId) => client.post('/wishlist', { productId }),
  remove: (productId) => client.delete(`/wishlist/${productId}`),
};
