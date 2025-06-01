// utils/axiosConfig.jsx
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use different URLs for development and production
const BASE_URL =" https://9e96-197-57-121-35.ngrok-free.app/api";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from storage
    const token = await AsyncStorage.getItem('@auth_token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get refresh token
        const refreshToken = await AsyncStorage.getItem('@refresh_token');
        
        if (!refreshToken) {
          // No refresh token, redirect to login
          throw new Error('No refresh token available');
        }
        
        // Call refresh token endpoint
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        // Save new tokens
        const { token, refresh_token } = response.data;
        await AsyncStorage.setItem('@auth_token', token);
        await AsyncStorage.setItem('@refresh_token', refresh_token);
        
        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        await AsyncStorage.removeItem('@auth_token');
        await AsyncStorage.removeItem('@refresh_token');
        await AsyncStorage.removeItem('@user');
        
        // You might want to redirect to login screen here
        // For example, using a navigation service or event emitter
        
        return Promise.reject(refreshError);
      }
    }
    
    // For network errors, provide a more user-friendly message
    if (!error.response) {
      error.message = 'Network error. Please check your internet connection.';
    }
    
    // For server errors (500+)
    if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
