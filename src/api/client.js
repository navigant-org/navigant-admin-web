import axios from 'axios';

import storage, { KEYS } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.load(KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Clear storage and redirect
      storage.remove(KEYS.AUTH_TOKEN); // or clearAll() if you prefer
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;
