/**
 * Authentication Service
 *
 * This service handles user authentication, including login, registration,
 * token management, and user session.
 */

import { AUTH_ENDPOINTS, USE_MOCK_DATA } from '../config/api.config';
import api from './api.service';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: string;
  };
  message?: string; // Optional message for registration success
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: string;
}

/**
 * Register a new user
 * @param userData - User registration data
 * @returns Promise with auth response
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  // If using mock data, return a mock response
  if (USE_MOCK_DATA) {
    console.log('Using mock registration data');

    // Create a mock auth response
    const mockAuthResponse: AuthResponse = {
      token: 'mock-token-' + Math.random().toString(36).substring(2),
      refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(2),
      user: {
        id: Math.random().toString(36).substring(2),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user'
      }
    };

    // Store tokens and user data
    localStorage.setItem('token', mockAuthResponse.token);
    localStorage.setItem('refreshToken', mockAuthResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));

    return mockAuthResponse;
  }

  try {
    // Format the data for Django
    const requestData = {
      email: userData.email,
      password: userData.password,
      password2: userData.confirmPassword || userData.password, // Django expects password2 for confirmation
      first_name: userData.firstName,
      last_name: userData.lastName
    };

    // Make the API call - registration does NOT return tokens
    const response = await api.post<{
      message: string;
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
      }
    }>(AUTH_ENDPOINTS.REGISTER, requestData);

    // Registration successful - return user data without tokens
    // User must login separately to get authentication tokens
    const registrationResponse: AuthResponse = {
      token: '', // No token provided during registration
      refreshToken: '', // No refresh token provided during registration
      user: {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        role: 'user' // Default role
      },
      message: response.message // Include success message
    };

    // DO NOT store tokens - user is not authenticated yet
    // Only store user data temporarily for potential auto-login
    localStorage.setItem('registeredUser', JSON.stringify(registrationResponse.user));

    return registrationResponse;
  } catch (error: any) {
    console.error('Registration error:', error);
    console.error('Request data sent:', {
      email: userData.email,
      password: userData.password,
      password2: userData.confirmPassword || userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName
    });
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }

    // If we're in development mode, return mock data even on error
    if (USE_MOCK_DATA) {
      console.log('Using mock registration data after error');

      // Create a mock auth response
      const mockAuthResponse: AuthResponse = {
        token: 'mock-token-' + Math.random().toString(36).substring(2),
        refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(2),
        user: {
          id: Math.random().toString(36).substring(2),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'user'
        }
      };

      // Store tokens and user data
      localStorage.setItem('token', mockAuthResponse.token);
      localStorage.setItem('refreshToken', mockAuthResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));

      return mockAuthResponse;
    }

    // Provide more specific error messages
    if (error.response && error.response.data) {
      // Handle Django REST framework error format
      const errorData = error.response.data;
      console.error('Django error response:', errorData);

      // Handle array-based error messages (Django REST framework format)
      if (errorData.email && Array.isArray(errorData.email)) {
        throw new Error(`Email error: ${errorData.email[0]}`);
      } else if (errorData.password && Array.isArray(errorData.password)) {
        throw new Error(`Password error: ${errorData.password[0]}`);
      } else if (errorData.password2 && Array.isArray(errorData.password2)) {
        throw new Error(`Password confirmation error: ${errorData.password2[0]}`);
      } else if (errorData.first_name && Array.isArray(errorData.first_name)) {
        throw new Error(`First name error: ${errorData.first_name[0]}`);
      } else if (errorData.last_name && Array.isArray(errorData.last_name)) {
        throw new Error(`Last name error: ${errorData.last_name[0]}`);
      } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
        throw new Error(errorData.non_field_errors[0]);
      } else if (typeof errorData === 'string') {
        throw new Error(errorData);
      } else if (errorData.detail) {
        throw new Error(errorData.detail);
      } else {
        // If we can't parse the error, show the raw response
        throw new Error(`Registration failed: ${JSON.stringify(errorData)}`);
      }
    }

    throw error;
  }
};

/**
 * Login user
 * @param credentials - Login credentials
 * @returns Promise with auth response
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // If using mock data, return a mock response
  if (USE_MOCK_DATA) {
    console.log('Using mock login data');

    // Create a mock auth response
    const mockAuthResponse: AuthResponse = {
      token: 'mock-token-' + Math.random().toString(36).substring(2),
      refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(2),
      user: {
        id: Math.random().toString(36).substring(2),
        email: credentials.email,
        firstName: 'Mock',
        lastName: 'User',
        role: 'user'
      }
    };

    // Store tokens and user data
    localStorage.setItem('token', mockAuthResponse.token);
    localStorage.setItem('refreshToken', mockAuthResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));

    return mockAuthResponse;
  }

  try {
    // Make the API call - Django backend returns user data along with tokens
    const response = await api.post<{
      access: string;
      refresh: string;
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        avatar?: string;
      };
    }>(AUTH_ENDPOINTS.LOGIN, {
      email: credentials.email,
      password: credentials.password
    });

    // Transform the response to match our AuthResponse type
    const authResponse: AuthResponse = {
      token: response.access,
      refreshToken: response.refresh,
      user: {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.first_name,
        lastName: response.user.last_name,
        avatar: response.user.avatar,
        role: 'user' // Default role
      }
    };

    // Store tokens and user data
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResponse.user));

    return authResponse;
  } catch (error: any) {
    console.error('Login error:', error);

    // If we're in development mode, return mock data even on error
    if (USE_MOCK_DATA) {
      console.log('Using mock login data after error');

      // Create a mock auth response
      const mockAuthResponse: AuthResponse = {
        token: 'mock-token-' + Math.random().toString(36).substring(2),
        refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(2),
        user: {
          id: Math.random().toString(36).substring(2),
          email: credentials.email,
          firstName: 'Mock',
          lastName: 'User',
          role: 'user'
        }
      };

      // Store tokens and user data
      localStorage.setItem('token', mockAuthResponse.token);
      localStorage.setItem('refreshToken', mockAuthResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));

      return mockAuthResponse;
    }

    // Provide more specific error messages
    if (error.response && error.response.data) {
      // Handle Django REST framework error format
      const errorData = error.response.data;

      if (errorData.detail) {
        throw new Error(errorData.detail);
      } else if (errorData.non_field_errors) {
        throw new Error(errorData.non_field_errors[0]);
      }
    }

    throw error;
  }
};

/**
 * Login with social provider
 * @param provider - Social provider (google, github, etc.)
 * @param token - Social provider token
 * @returns Promise with auth response
 */
export const socialLogin = async (provider: string, token: string): Promise<AuthResponse> => {
  try {
    // Make the API call
    const response = await api.post<{
      access: string;
      refresh: string;
    }>(AUTH_ENDPOINTS.SOCIAL_LOGIN, {
      provider,
      access_token: token
    });

    // Get user info with the token
    const userResponse = await api.get<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      avatar?: string;
    }>(AUTH_ENDPOINTS.USER_INFO, {
      headers: {
        Authorization: `Bearer ${response.access}`
      }
    });

    // Transform the response to match our AuthResponse type
    const authResponse: AuthResponse = {
      token: response.access,
      refreshToken: response.refresh,
      user: {
        id: userResponse.id,
        email: userResponse.email,
        firstName: userResponse.first_name,
        lastName: userResponse.last_name,
        avatar: userResponse.avatar,
        role: 'user' // Default role
      }
    };

    // Store tokens and user data
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResponse.user));

    return authResponse;
  } catch (error) {
    console.error('Social login error:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns Promise<void>
 */
export const logout = async (): Promise<void> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('token');

    if (refreshToken && accessToken) {
      // Call logout endpoint to invalidate token on server
      await api.post(AUTH_ENDPOINTS.LOGOUT, {
        refresh: refreshToken
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw the error - logout should always succeed locally
  } finally {
    // Clear local storage regardless of API response
    clearTokens();
  }
};

/**
 * Refresh authentication token
 * @returns Promise with new token
 */
export const refreshToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    console.log('🔄 Refreshing access token...');
    // Make the API call to refresh the token
    const response = await api.post<{ access: string; refresh?: string }>(AUTH_ENDPOINTS.REFRESH_TOKEN, {
      refresh: refreshToken,
    });

    if (response.access) {
      localStorage.setItem('token', response.access);

      // If a new refresh token is provided (token rotation), update it
      if (response.refresh) {
        localStorage.setItem('refreshToken', response.refresh);
        console.log('🔄 Refresh token rotated');
      }

      console.log('✅ Token refreshed successfully');
      return response.access;
    } else {
      throw new Error('Invalid response from refresh token endpoint');
    }
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    // Clear tokens on refresh failure
    clearTokens();
    throw error;
  }
};

/**
 * Request password reset
 * @param email - User email
 * @returns Promise<void>
 */
export const forgotPassword = async (email: string): Promise<void> => {
  await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
};

/**
 * Reset password with token
 * @param token - Reset token
 * @param password - New password
 * @param confirmPassword - Confirm new password
 * @returns Promise<void>
 */
export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string
): Promise<void> => {
  await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
    token,
    password,
    confirmPassword,
  });
};

/**
 * Verify email with token
 * @param token - Verification token
 * @returns Promise<void>
 */
export const verifyEmail = async (token: string): Promise<void> => {
  await api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, { token });
};

/**
 * Get current user from local storage
 * @returns User object or null
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');

  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  }
  return null;
};

/**
 * Get authentication token
 * @returns Token string or null
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Check if the current token is expired
 * @returns Boolean indicating if token is expired
 */
export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));

    // Check if token has expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't parse it
  }
};

/**
 * Validate current token and refresh if needed
 * @returns Promise<string> Valid token
 */
export const ensureValidToken = async (): Promise<string> => {
  const token = getToken();

  if (!token) {
    throw new Error('No token available');
  }

  if (isTokenExpired()) {
    console.log('🔄 Token expired, refreshing...');
    return await refreshToken();
  }

  return token;
};

/**
 * Clear all authentication tokens and user data
 */
export const clearTokens = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

/**
 * Clear invalid tokens on app initialization
 */
export const clearInvalidTokens = (): void => {
  try {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    // Check if tokens exist but are invalid (too short, malformed, etc.)
    if (token && (token.length < 10 || !token.includes('.'))) {
      console.log('🧹 Clearing invalid access token');
      localStorage.removeItem('token');
    }

    if (refreshToken && (refreshToken.length < 10 || !refreshToken.includes('.'))) {
      console.log('🧹 Clearing invalid refresh token');
      localStorage.removeItem('refreshToken');
    }

    // If we cleared tokens, also clear user data
    if ((!token || token.length < 10) && (!refreshToken || refreshToken.length < 10)) {
      localStorage.removeItem('user');
    }
  } catch (error) {
    console.error('Error clearing invalid tokens:', error);
    // If there's any error, clear everything to be safe
    clearTokens();
  }
};

export default {
  register,
  login,
  socialLogin,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  getToken,
  isAuthenticated,
  isTokenExpired,
  ensureValidToken,
  clearTokens,
  clearInvalidTokens,
};
