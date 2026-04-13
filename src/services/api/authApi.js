import client from '../http/client';

export const authApi = {
  register: (userData) => client.post('/auth/register', userData),
  login: (credentials) => client.post('/auth/login', credentials),
  logout: () => client.post('/auth/logout'),
  refreshToken: (refreshToken) => client.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => client.post('/auth/forgot-password', { email }),
  resetPassword: (token, passwords) => client.patch(`/auth/reset-password/${token}`, passwords),
};
