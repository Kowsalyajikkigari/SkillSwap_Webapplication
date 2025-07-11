/**
 * API Service
 *
 * This service handles all HTTP requests to the backend API.
 * It includes methods for GET, POST, PUT, PATCH, and DELETE requests.
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, USE_MOCK_DATA } from '../config/api.config';
import { getToken, clearTokens } from './auth.service';

// Debug: Log the API_BASE_URL to ensure it's correct
console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);
console.log('🔧 API Service loaded with fixes applied - Version 2.0');

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// List of public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  '/auth/register/',
  '/auth/login/',
  '/auth/password/reset/',
  '/skills/categories/',
  '/skills/all/', // For public skill browsing
];

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Debug logging for profile creation issues
    if (config.url?.includes('/auth/profile/')) {
      console.log('🌐 Profile API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`
      });
    }

    // Check if this is a public endpoint
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
      config.url?.includes(endpoint)
    );

    // Only add auth token for non-public endpoints
    if (!isPublicEndpoint) {
      const token = getToken();
      if (token && token.length > 10) { // Basic validation to avoid sending invalid tokens
        // Django REST framework with JWT expects Authorization: Bearer <token>
        config.headers.Authorization = `Bearer ${token}`;
        if (config.url?.includes('/auth/profile/')) {
          console.log('🔐 Added auth token to profile request');
        }
      } else if (config.url?.includes('/auth/profile/')) {
        console.log('⚠️ No valid token found for profile request');
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using Django's refresh token endpoint
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('🔄 Auto-refreshing expired token...');
          const response = await apiClient.post('/auth/token/refresh/', {
            refresh: refreshToken,
          });

          // Django returns access token in the 'access' field
          const { access, refresh: newRefresh } = response.data;
          localStorage.setItem('token', access);

          // If a new refresh token is provided (token rotation), update it
          if (newRefresh) {
            localStorage.setItem('refreshToken', newRefresh);
            console.log('🔄 Refresh token rotated automatically');
          }

          console.log('✅ Token auto-refreshed successfully');

          // Retry the original request with the new token
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${access}`,
          };

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, log out the user
        console.error('❌ Auto token refresh failed:', refreshError);
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Generic GET request
 * @param url - API endpoint
 * @param params - Query parameters
 * @param config - Additional axios config
 * @param mockData - Optional mock data to return if USE_MOCK_DATA is true
 * @returns Promise with response data
 */
export const get = async <T>(
  url: string,
  params?: Record<string, any>,
  config?: AxiosRequestConfig,
  mockData?: T
): Promise<T> => {
  // If USE_MOCK_DATA is true and mockData is provided, return it immediately
  if (USE_MOCK_DATA && mockData) {
    console.log(`Using mock data for GET ${url}`);
    return mockData;
  }

  try {
    // Handle full URLs by extracting the path part
    const requestUrl = url.startsWith('http') ? new URL(url).pathname : url;
    
    const response: AxiosResponse<T> = await apiClient.get(requestUrl, {
      params,
      ...config,
    });
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);

    // If mockData is provided, return it as fallback
    if (mockData) {
      console.log(`Using fallback mock data for GET ${url} after error`);
      return mockData;
    }

    throw error;
  }
};

/**
 * Generic POST request
 * @param url - API endpoint
 * @param data - Request body
 * @param config - Additional axios config
 * @returns Promise with response data
 */
export const post = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    // Handle full URLs by extracting the path part
    const requestUrl = url.startsWith('http') ? new URL(url).pathname : url;
    
    // Debug logging for voice-ai calls
    if (url.includes('voice-ai')) {
      console.log('🎤 Voice API Debug:', {
        originalUrl: url,
        requestUrl: requestUrl,
        baseURL: API_BASE_URL,
        finalUrl: `${API_BASE_URL}${requestUrl}`
      });
    }
    
    const response: AxiosResponse<T> = await apiClient.post(requestUrl, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

/**
 * Generic PUT request
 * @param url - API endpoint
 * @param data - Request body
 * @param config - Additional axios config
 * @returns Promise with response data
 */
export const put = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    // Handle full URLs by extracting the path part
    const requestUrl = url.startsWith('http') ? new URL(url).pathname : url;
    
    const response: AxiosResponse<T> = await apiClient.put(requestUrl, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

/**
 * Generic PATCH request
 * @param url - API endpoint
 * @param data - Request body
 * @param config - Additional axios config
 * @returns Promise with response data
 */
export const patch = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    // Handle full URLs by extracting the path part
    const requestUrl = url.startsWith('http') ? new URL(url).pathname : url;
    
    const response: AxiosResponse<T> = await apiClient.patch(requestUrl, data, config);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

/**
 * Generic DELETE request
 * @param url - API endpoint
 * @param config - Additional axios config
 * @returns Promise with response data
 */
export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    // Handle full URLs by extracting the path part
    const requestUrl = url.startsWith('http') ? new URL(url).pathname : url;
    
    const response: AxiosResponse<T> = await apiClient.delete(requestUrl, config);
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

/**
 * Upload file(s)
 * @param url - API endpoint
 * @param files - File or array of files to upload
 * @param additionalData - Additional form data
 * @param config - Additional axios config
 * @returns Promise with response data
 */
export const uploadFiles = async <T>(
  url: string,
  files: File | File[],
  additionalData?: Record<string, any>,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    // Handle full URLs by extracting the path part
    const requestUrl = url.startsWith('http') ? new URL(url).pathname : url;
    
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
    } else {
      formData.append('file', files);
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response: AxiosResponse<T> = await apiClient.post(requestUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });

    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError);
    throw error;
  }
};

/**
 * Handle API errors
 * @param error - Axios error
 */
const handleApiError = (error: AxiosError): void => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    console.error('Status:', error.response.status);
    console.error('Headers:', error.response.headers);

    // Show user-friendly error message based on status code
    let errorMessage = 'An error occurred while communicating with the server.';

    switch (error.response.status) {
      case 400:
        errorMessage = 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        errorMessage = 'You are not authorized. Please log in again.';
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
    }

    // You can use a toast notification library here to show the error message
    // For now, we'll just log it
    console.error('User-friendly error:', errorMessage);

  } else if (error.request) {
    // The request was made but no response was received
    console.error('API Error Request:', error.request);

    // Check for specific connection errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.error('🔌 Backend connection failed. Is the Django server running on http://127.0.0.1:8000?');
      console.error('💡 To start backend: cd skill-swap-backend && python manage.py runserver 127.0.0.1:8000');

      // Show user-friendly message for connection errors
      const connectionError = new Error('Backend server is not running. Please start the Django server and try again.');
      connectionError.name = 'ConnectionError';
      throw connectionError;
    } else {
      console.error('Network error. Please check your internet connection.');

      // Create a user-friendly network error
      const networkError = new Error('Network connection failed. Please check your internet connection and try again.');
      networkError.name = 'NetworkError';
      throw networkError;
    }
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error Message:', error.message);

    // Create a generic error with better messaging
    const genericError = new Error(error.message || 'An unexpected error occurred. Please try again.');
    genericError.name = 'RequestError';
    throw genericError;
  }
};

// Additional API methods for onboarding
export const getProfileCompletionStatus = async (): Promise<any> => {
  return get('/api/auth/profile/completion-status/');
};

export const updateProfile = async (data: any): Promise<any> => {
  // Check if we have a valid avatar file
  const hasValidAvatar = data.avatar && data.avatar instanceof File;

  if (hasValidAvatar) {
    console.log('📸 Processing profile update with avatar file upload...');

    // Use FormData for file uploads with proper field names
    const formData = new FormData();

    // Add the avatar file with the correct field name
    formData.append('avatar', data.avatar);

    // Add other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'avatar' && value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    console.log('📋 FormData contents for profile update:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
    }

    // Use PATCH method with FormData
    try {
      const response = await apiClient.patch('/auth/user/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError);
      throw error;
    }
  } else {
    console.log('📝 Processing profile update without avatar (JSON)...');

    // Remove avatar from data if it's not a valid file to avoid backend errors
    const cleanData = { ...data };
    if (data.avatar && !(data.avatar instanceof File)) {
      console.log('⚠️ Removing invalid avatar data from request:', typeof data.avatar);
      delete cleanData.avatar;
    }

    return patch('/auth/user/profile/', cleanData);
  }
};

export const updateProfilePreferences = async (data: any): Promise<any> => {
  return patch('/auth/profile/', data);
};

export const createSkill = async (data: any): Promise<any> => {
  return post('/skills/all/', data);
};

export const searchSkills = async (query: string): Promise<any[]> => {
  return get(`/skills/all/?search=${encodeURIComponent(query)}`);
};

export const createUserTeachingSkill = async (data: any): Promise<any> => {
  return post('/skills/teaching/', data);
};

export const createUserLearningSkill = async (data: any): Promise<any> => {
  return post('/skills/learning/', data);
};

export const getUserTeachingSkills = async (): Promise<any[]> => {
  return get('/skills/teaching/');
};

export const getUserLearningSkills = async (): Promise<any[]> => {
  return get('/skills/learning/');
};

export const apiService = {
  get,
  post,
  put,
  patch,
  del,
  uploadFiles,
  getProfileCompletionStatus,
  updateProfile,
  updateProfilePreferences,
  createSkill,
  searchSkills,
  createUserTeachingSkill,
  createUserLearningSkill,
  getUserTeachingSkills,
  getUserLearningSkills,
};

export default apiService;
