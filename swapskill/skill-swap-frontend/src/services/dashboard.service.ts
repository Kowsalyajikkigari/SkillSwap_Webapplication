/**
 * Dashboard Service
 * 
 * This service handles dashboard-related API calls and data fetching.
 */

import { get } from './api.service';
import { API_BASE_URL } from '../config/api.config';

// Types
export interface DashboardUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio: string;
  location: string;
  member_since: string;
}

export interface DashboardProfile {
  level: number;
  points: number;
  next_level_points: number;
  progress_to_next_level: number;
  average_rating: number;
  sessions_completed: number;
}

export interface DashboardSkills {
  teaching_count: number;
  learning_count: number;
}

export interface DashboardSessions {
  completed: number;
  total: number;
  pending: number;
}

export interface DashboardActivity {
  conversations: number;
  hours_exchanged: number;
}

export interface DashboardStats {
  user: DashboardUser;
  profile: DashboardProfile;
  skills: DashboardSkills;
  sessions: DashboardSessions;
  activity: DashboardActivity;
}

// Dashboard API endpoints
const DASHBOARD_ENDPOINTS = {
  GET_STATS: `${API_BASE_URL}/auth/dashboard/stats/`,
  GET_RECOMMENDED_USERS: `${API_BASE_URL}/auth/dashboard/recommended/`,
  GET_UPCOMING_SESSIONS: `${API_BASE_URL}/sessions/sessions/upcoming/`,
  GET_USER_SKILLS: `${API_BASE_URL}/skills/teaching/`,
  GET_USER_LEARNING_SKILLS: `${API_BASE_URL}/skills/learning/`,
};

/**
 * Get dashboard statistics for the current user
 */
export const getDashboardStats = async ({ signal }: { signal?: AbortSignal } = {}): Promise<DashboardStats> => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    const response = await get(DASHBOARD_ENDPOINTS.GET_STATS, { signal });
    console.log('✅ Dashboard stats fetched successfully:', response);
    return response;
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('❌ Error fetching dashboard stats:', error);
    }
    throw error;
  }
};

/**
 * Get upcoming sessions for the dashboard
 */
export const getUpcomingSessions = async ({ signal }: { signal?: AbortSignal } = {}) => {
  try {
    console.log('📅 Fetching upcoming sessions...');
    const response = await get(DASHBOARD_ENDPOINTS.GET_UPCOMING_SESSIONS, { signal });
    return response;
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('❌ Error fetching upcoming sessions:', error);
    }
    // Return empty array as fallback
    return [];
  }
};

/**
 * Get recent activity for the dashboard
 */
export const getRecentActivity = async () => {
  try {
    console.log('🔄 Fetching recent activity...');
    const response = await get(`${API_BASE_URL}/activity/recent/`);
    return response;
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    throw error;
  }
};

/**
 * Get recommended users/matches for the dashboard
 */
export const getRecommendedUsers = async ({ signal }: { signal?: AbortSignal } = {}) => {
  try {
    console.log('👥 Fetching recommended users...');
    const response = await get(DASHBOARD_ENDPOINTS.GET_RECOMMENDED_USERS, { signal });
    return response;
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('❌ Error fetching recommended users:', error);
    }
    // Return empty arrays as fallback
    return { teachers: [], students: [] };
  }
};

/**
 * Get user's teaching skills
 */
export const getUserTeachingSkills = async ({ signal }: { signal?: AbortSignal } = {}) => {
  try {
    console.log('🎓 Fetching user teaching skills...');
    const response = await get(DASHBOARD_ENDPOINTS.GET_USER_SKILLS, { signal });
    return response;
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('❌ Error fetching teaching skills:', error);
    }
    return [];
  }
};

/**
 * Get user's learning skills
 */
export const getUserLearningSkills = async ({ signal }: { signal?: AbortSignal } = {}) => {
  try {
    console.log('📚 Fetching user learning skills...');
    const response = await get(DASHBOARD_ENDPOINTS.GET_USER_LEARNING_SKILLS, { signal });
    return response;
  } catch (error) {
    if (error.name !== 'CanceledError') {
      console.error('❌ Error fetching learning skills:', error);
    }
    return [];
  }
};

export default {
  getDashboardStats,
  getUpcomingSessions,
  getRecentActivity,
  getRecommendedUsers,
  getUserTeachingSkills,
  getUserLearningSkills,
};