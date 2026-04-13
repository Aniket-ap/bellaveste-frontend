import client from '../http/client';

export const orderApi = {
  create: (orderData) => client.post('/orders', orderData),
  getMyOrders: () => client.get('/orders/my-orders'),
  getById: (id) => client.get(`/orders/${id}`),
  markPaid: (id, payload) => client.patch(`/orders/${id}/pay`, payload || {}),
};
