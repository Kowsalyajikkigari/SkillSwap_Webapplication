/**
 * Users Service
 * 
 * This service handles user-related API calls and data fetching.
 */

import { get } from './api.service';
import { API_BASE_URL } from '../config/api.config';

// Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  date_joined: string;
}

export interface UserProfile {
  user: User;
  level: number;
  points: number;
  average_rating: number;
  sessions_completed: number;
  teaching_skills: any[];
  learning_skills: any[];
}

// User API endpoints
const USER_ENDPOINTS = {
  GET_CURRENT_USER: `${API_BASE_URL}/auth/user/`,
  GET_ALL_USERS: `${API_BASE_URL}/auth/user/`, // Fixed: Use auth endpoint
  GET_USER_PROFILE: (id: string) => `${API_BASE_URL}/auth/user/${id}/profile/`, // Fixed: Use auth endpoint
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    console.log('👤 Fetching current user...');
    const response = await get(USER_ENDPOINTS.GET_CURRENT_USER);
    const user = response as User;
    if (!user || typeof user.id !== 'number') throw new Error('Invalid user response');
    return user;
  } catch (error) {
    console.error('❌ Error fetching current user:', error);
    throw error;
  }
};

/**
 * Get all users (for matching/exploration)
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    console.log('👥 Fetching all users...');
    const response = await get(USER_ENDPOINTS.GET_ALL_USERS);
    const users = response as User[];
    if (!Array.isArray(users)) throw new Error('Invalid users response');
    return users;
  } catch (error) {
    console.error('❌ Error fetching all users:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    console.log(`👤 Fetching user profile for ID: ${userId}`);
    const response = await get(USER_ENDPOINTS.GET_USER_PROFILE(userId));
    const profile = response as UserProfile;
    if (!profile || typeof profile.level !== 'number') throw new Error('Invalid user profile response');
    return profile;
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    throw error;
  }
};

const usersService = {
  getCurrentUser,
  getAllUsers,
  getUserProfile,
};

export default usersService;