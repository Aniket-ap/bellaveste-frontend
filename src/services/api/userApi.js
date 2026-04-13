import client from '../http/client';

export const userApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (userData) => client.patch('/users/updateMe', userData),
  updateMyPassword: (passwords) => client.patch('/users/updateMyPassword', passwords),
  deleteMe: () => client.delete('/users/deleteMe'),
  // Admin routes
  getAllUsers: () => client.get('/users'),
  blockUser: (id) => client.patch(`/users/${id}/block`),
  unblockUser: (id) => client.patch(`/users/${id}/unblock`),
};
