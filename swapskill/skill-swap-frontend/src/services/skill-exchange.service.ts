/**
 * Skill Exchange Service
 * 
 * This service handles skill exchange requests, matching, and session management
 * for the SkillSwap application.
 */

import { get, post, put, del } from './api.service';
import { API_BASE_URL } from '../config/api.config';

// Types
export interface SkillExchangeRequest {
  id: number;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  provider: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
  skill: {
    id: number;
    name: string;
    category: string;
  };
  message: string;
  proposed_date?: string;
  proposed_time?: string;
  session_type: 'virtual' | 'in_person';
  location?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateSkillExchangeRequest {
  provider_id: number;
  skill_id: number;
  message: string;
  proposed_date?: string;
  proposed_time?: string;
  session_type?: 'virtual' | 'in_person';
  location?: string;
}

export interface SkillMatch {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
    bio?: string;
    location?: string;
    rating?: number;
    sessions_completed?: number;
  };
  matching_skills: Array<{
    id: number;
    name: string;
    category: string;
    level?: string;
  }>;
  compatibility_score: number;
}

// API Endpoints
const SKILL_EXCHANGE_ENDPOINTS = {
  GET_MATCHES: `${API_BASE_URL}/sessions/matches/`,
  CREATE_REQUEST: `${API_BASE_URL}/sessions/requests/`,
  GET_REQUESTS: `${API_BASE_URL}/sessions/requests/`,
  UPDATE_REQUEST: (id: number) => `${API_BASE_URL}/sessions/requests/${id}/`,
  ACCEPT_REQUEST: (id: number) => `${API_BASE_URL}/sessions/requests/${id}/accept/`,
  DECLINE_REQUEST: (id: number) => `${API_BASE_URL}/sessions/requests/${id}/decline/`,
  CANCEL_REQUEST: (id: number) => `${API_BASE_URL}/sessions/requests/${id}/cancel/`,
};

/**
 * Get skill matches for the current user
 */
export const getSkillMatches = async (params?: {
  skill_category?: string;
  location?: string;
  session_type?: string;
  limit?: number;
}): Promise<SkillMatch[]> => {
  try {
    console.log('🔍 Fetching skill matches...');
    const queryParams = new URLSearchParams();
    
    if (params?.skill_category) queryParams.append('skill_category', params.skill_category);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.session_type) queryParams.append('session_type', params.session_type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `${SKILL_EXCHANGE_ENDPOINTS.GET_MATCHES}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await get(url);
    
    console.log('✅ Skill matches fetched successfully');
    return response;
  } catch (error) {
    console.error('❌ Error fetching skill matches:', error);
    // Return mock data for development
    return generateMockMatches();
  }
};

/**
 * Create a new skill exchange request
 */
export const createSkillExchangeRequest = async (data: CreateSkillExchangeRequest): Promise<SkillExchangeRequest> => {
  try {
    console.log('📤 Creating skill exchange request...');
    const response = await post(SKILL_EXCHANGE_ENDPOINTS.CREATE_REQUEST, data);
    
    console.log('✅ Skill exchange request created successfully');
    return response;
  } catch (error) {
    console.error('❌ Error creating skill exchange request:', error);
    throw error;
  }
};

/**
 * Get skill exchange requests for the current user
 */
export const getSkillExchangeRequests = async (params?: {
  status?: string;
  type?: 'sent' | 'received';
}): Promise<SkillExchangeRequest[]> => {
  try {
    console.log('📥 Fetching skill exchange requests...');
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);

    const url = `${SKILL_EXCHANGE_ENDPOINTS.GET_REQUESTS}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await get(url);

    console.log('✅ Skill exchange requests fetched successfully');

    // Handle paginated response
    if (response && Array.isArray(response.results)) {
      return response.results;
    }

    // Handle direct array response
    if (Array.isArray(response)) {
      return response;
    }

    // Return empty array if unexpected format
    console.warn('⚠️ Unexpected response format for skill exchange requests:', response);
    return [];
  } catch (error) {
    console.error('❌ Error fetching skill exchange requests:', error);
    return [];
  }
};

/**
 * Accept a skill exchange request
 */
export const acceptSkillExchangeRequest = async (requestId: number): Promise<SkillExchangeRequest> => {
  try {
    console.log(`✅ Accepting skill exchange request ${requestId}...`);
    const response = await post(SKILL_EXCHANGE_ENDPOINTS.ACCEPT_REQUEST(requestId), {});
    
    console.log('✅ Skill exchange request accepted successfully');
    return response;
  } catch (error) {
    console.error('❌ Error accepting skill exchange request:', error);
    throw error;
  }
};

/**
 * Decline a skill exchange request
 */
export const declineSkillExchangeRequest = async (requestId: number, reason?: string): Promise<SkillExchangeRequest> => {
  try {
    console.log(`❌ Declining skill exchange request ${requestId}...`);
    const response = await post(SKILL_EXCHANGE_ENDPOINTS.DECLINE_REQUEST(requestId), { reason });
    
    console.log('✅ Skill exchange request declined successfully');
    return response;
  } catch (error) {
    console.error('❌ Error declining skill exchange request:', error);
    throw error;
  }
};

/**
 * Cancel a skill exchange request
 */
export const cancelSkillExchangeRequest = async (requestId: number): Promise<void> => {
  try {
    console.log(`🚫 Cancelling skill exchange request ${requestId}...`);
    await del(SKILL_EXCHANGE_ENDPOINTS.CANCEL_REQUEST(requestId));
    
    console.log('✅ Skill exchange request cancelled successfully');
  } catch (error) {
    console.error('❌ Error cancelling skill exchange request:', error);
    throw error;
  }
};

/**
 * Generate mock matches for development
 */
const generateMockMatches = (): SkillMatch[] => {
  return [
    {
      user: {
        id: 1,
        first_name: "Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@example.com",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        bio: "Full-stack developer with 5 years of experience. Love teaching and learning new technologies.",
        location: "San Francisco, CA",
        rating: 4.8,
        sessions_completed: 23
      },
      matching_skills: [
        { id: 1, name: "React", category: "Frontend Development" },
        { id: 2, name: "JavaScript", category: "Programming Languages" }
      ],
      compatibility_score: 95
    },
    {
      user: {
        id: 2,
        first_name: "Michael",
        last_name: "Chen",
        email: "michael.chen@example.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        bio: "UI/UX designer passionate about creating beautiful and functional interfaces.",
        location: "New York, NY",
        rating: 4.6,
        sessions_completed: 18
      },
      matching_skills: [
        { id: 3, name: "UI Design", category: "Design" },
        { id: 4, name: "Figma", category: "Design Tools" }
      ],
      compatibility_score: 87
    },
    {
      user: {
        id: 3,
        first_name: "Emily",
        last_name: "Rodriguez",
        email: "emily.rodriguez@example.com",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        bio: "Data scientist with expertise in machine learning and Python. Always excited to share knowledge.",
        location: "Austin, TX",
        rating: 4.9,
        sessions_completed: 31
      },
      matching_skills: [
        { id: 5, name: "Python", category: "Programming Languages" },
        { id: 6, name: "Machine Learning", category: "Data Science" }
      ],
      compatibility_score: 92
    }
  ];
};

export default {
  getSkillMatches,
  createSkillExchangeRequest,
  getSkillExchangeRequests,
  acceptSkillExchangeRequest,
  declineSkillExchangeRequest,
  cancelSkillExchangeRequest,
};
