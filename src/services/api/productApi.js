import client from '../http/client';

export const productApi = {
  getAll: (params) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return client.get(queryString ? `/products?${queryString}` : '/products');
  },
  getByCategory: (categoryId) => client.get(`/products?category=${categoryId}`),
  getBySlug: (slug) => client.get(`/products?slug=${encodeURIComponent(slug)}`),
  getById: (id) => client.get(`/products/${id}`),
};
