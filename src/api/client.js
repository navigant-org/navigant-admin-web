import axios from 'axios';

const API_BASE_URL = 'https://navigant-backend.azurewebsites.net/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
apiClient.interceptors.request.use(
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

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally (optional: redirect to login)
    if (error.response && error.response.status === 401) {
      // Clear storage and potentially redirect
      // localStorage.removeItem('token');
      // window.location.href = '/auth'; // Careful with this in SPA
      console.warn('Unauthorized access. Please login again.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
