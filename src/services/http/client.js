import axios from 'axios';
import { env } from '../../app/config/env';

const BASE_URL = env.apiBaseUrl;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
client.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            // Use a new axios instance to avoid interceptor loops
            const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
            
            if (response.data.status === 'success') {
                const { token } = response.data;
                localStorage.setItem('token', token);
                
                // Update header and retry original request
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return client(originalRequest);
            }
        }
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default client;
