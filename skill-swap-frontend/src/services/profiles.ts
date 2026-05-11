import { get, put } from './api.service';
import { User } from '@/types';
import { USER_ENDPOINTS } from '@/config/api.config';
import { getToken, refreshToken as authRefreshToken, ensureValidToken } from './auth.service';

// Utility function to make authenticated requests with automatic token refresh
const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit,
  retryCount = 0
): Promise<Response> => {
  try {
    // Ensure we have a valid token (refresh if needed)
    const token = await ensureValidToken();

    const requestOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    };

    console.log(`🔑 Making authenticated request to: ${url}`);
    console.log(`🔑 Token (first 20 chars): ${token.substring(0, 20)}...`);

    const response = await fetch(url, requestOptions);

    // If 401 and we haven't retried yet, try to refresh token
    if (response.status === 401 && retryCount === 0) {
      console.log('🔄 Received 401, attempting token refresh...');
      try {
        const newToken = await authRefreshToken();
        console.log('✅ Token refreshed successfully');

        // Retry with new token
        const retryOptions = {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`,
          },
        };

        return await makeAuthenticatedRequest(url, retryOptions, retryCount + 1);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Redirect to login if refresh fails
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('No token available')) {
      console.error('❌ No authentication token available');
      window.location.href = '/login';
      throw new Error('Please log in to continue.');
    }

    // Check if it's a network connection error
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      console.error('❌ Network connection error:', error);
      throw new Error('Unable to connect to server. Please check if the backend is running on http://127.0.0.1:8000');
    }

    console.error('❌ Request failed:', error);
    throw error;
  }
};

// Utility function to add cache-busting to URLs (but not base64 data URLs)
export const addCacheBusting = (url: string | null | undefined): string => {
  if (!url) return '';

  // Check if it's a base64 data URL
  if (url.startsWith('data:')) {
    return url; // Don't add cache-busting to data URLs
  }

  // Check if it's a blob URL
  if (url.startsWith('blob:')) {
    return url; // Don't add cache-busting to blob URLs
  }

  // For regular HTTP/HTTPS URLs, add cache-busting
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }

  // For any other URL format, return as-is
  return url;
};

// Interface for user profile data from backend
export interface UserProfileData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  profile: {
    id: number;
    user: number;
    level: number;
    points: number;
    sessions_completed: number;
    average_rating: number;
    available_weekdays: boolean;
    available_weekends: boolean;
    available_mornings: boolean;
    available_afternoons: boolean;
    available_evenings: boolean;
  };
}

export interface ProfileUpdateData {
  bio?: string;
  location?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string | File;
  teachSkills?: string[];
  learnSkills?: string[];
  availability?: string[];
}

// Get current user's profile data with extended information
export const getCurrentUserProfile = async ({ signal }: { signal?: AbortSignal } = {}): Promise<UserProfileData> => {
  try {
    const response = await get<UserProfileData>(USER_ENDPOINTS.GET_PROFILE, { signal });
    return response;
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('Error fetching user profile:', error);
    }
    throw error;
  }
};

// Get all user profiles from backend
export const getAllProfiles = async (): Promise<UserProfileData[]> => {
  try {
    const response = await get<UserProfileData[]>(USER_ENDPOINTS.GET_USERS);
    return response;
  } catch (error) {
    console.error('Error fetching all profiles:', error);
    throw error;
  }
};

// Get a user profile by ID from backend
export const getProfileById = async (userId: string | number): Promise<UserProfileData> => {
  try {
    const response = await get<UserProfileData>(USER_ENDPOINTS.GET_USER(userId.toString()));
    return response;
  } catch (error) {
    console.error('Error fetching profile by ID:', error);
    throw error;
  }
};

export const updateProfile = async (data: ProfileUpdateData): Promise<UserProfileData> => {
  try {
    console.log('🔄 updateProfile called with data:', {
      ...data,
      avatar: data.avatar instanceof File ? `File: ${data.avatar.name}` : data.avatar
    });

    // If avatar is a File, we need to use FormData
    if (data.avatar instanceof File) {
      console.log('📤 Using FormData for file upload');
      const formData = new FormData();

      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'avatar' && value instanceof File) {
            formData.append(key, value);
            console.log(`✅ Added avatar file to FormData: ${value.name}`);
          } else if (typeof value === 'string' || typeof value === 'number') {
            formData.append(key, String(value));
            console.log(`✅ Added ${key} to FormData: ${value}`);
          }
        }
      });

      // Log FormData contents
      console.log('📋 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      // Use the authenticated request function for FormData uploads
      console.log('📡 Sending request to:', USER_ENDPOINTS.UPDATE_PROFILE);
      const response = await makeAuthenticatedRequest(USER_ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        body: formData,
      });

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);

        // Try to parse JSON error for better error messages
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          if (errorData && typeof errorData === 'object') {
            // Handle Django validation errors
            const validationErrors = Object.entries(errorData)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            errorMessage = `Validation error: ${validationErrors}`;
          }
        } catch (parseError) {
          // If not JSON, use the raw error text
          errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Profile update successful:', result);
      return result;
    } else {
      console.log('📤 Using JSON for regular update');
      // Use regular JSON for non-file updates
      const response = await put<UserProfileData>(USER_ENDPOINTS.UPDATE_PROFILE, data);
      return response;
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw error;
  }
};

// Upload avatar specifically
export const uploadAvatar = async (file: File): Promise<UserProfileData> => {
  try {
    console.log('📸 Uploading avatar file:', file.name);
    console.log('📸 File size:', file.size, 'bytes');
    console.log('📸 File type:', file.type);

    // Get current user profile to include required fields
    console.log('🔄 uploadAvatar - Fetching current user profile for required fields...');
    const currentProfile = await getCurrentUserProfile();

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('first_name', currentProfile.first_name);
    formData.append('last_name', currentProfile.last_name);

    console.log('📤 uploadAvatar - Uploading with required fields included');

    // Use makeAuthenticatedRequest for proper token handling and retry logic
    const response = await makeAuthenticatedRequest(USER_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: formData,
      // Don't set Content-Type for FormData - browser will set it with boundary
      // makeAuthenticatedRequest will handle Authorization header
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Avatar upload error:', errorText);
      console.error('❌ Response status:', response.status);
      console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Avatar upload successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    throw error;
  }
};
