import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to signin for auth endpoints, not assignment endpoints
    if (error.response?.status === 401) {
      const isAssignmentEndpoint = error.config?.url?.includes('/assignments');
      const isAuthEndpoint = error.config?.url?.includes('/auth');
      
      // For assignment endpoints, let the component handle the Google auth flow
      if (isAssignmentEndpoint) {
        return Promise.reject(error);
      }
      
      // For auth endpoints, redirect to signin
      if (isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Regular authentication
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  },

  // Google OAuth
  getGoogleAuthUrl: async () => {
    const response = await api.get('/auth/google');
    return response.data;
  },

  handleGoogleCallback: async (code) => {
    const response = await api.post('/auth/google/callback', { code });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const assignmentService = {
  // Get all assignments from Google Classroom
  getAllAssignments: async () => {
    const response = await api.get('/assignments');
    return response.data;
  },

  // Get all courses
  getCourses: async () => {
    const response = await api.get('/assignments/courses');
    return response.data;
  },

  // Get assignments for a specific course
  getCourseAssignments: async (courseId) => {
    const response = await api.get(`/assignments/course/${courseId}`);
    return response.data;
  },
};

export default api;
