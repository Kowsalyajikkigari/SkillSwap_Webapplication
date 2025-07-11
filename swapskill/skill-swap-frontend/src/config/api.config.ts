/**
 * API Configuration
 *
 * This file contains the configuration for the API endpoints.
 * It includes the base URL and all endpoint paths.
 */

// Base API URL - Django backend
// Using environment variable with fallback for direct connection to Django server
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

// Flag to use mock data when backend is not available
export const USE_MOCK_DATA = false;

// Authentication Endpoints - Adjusted for Django REST framework
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/auth/register/`,
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/token/refresh/`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/password/reset/`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/password/reset/confirm/`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/email/verify/`,
  SOCIAL_LOGIN: `${API_BASE_URL}/api/auth/social/login/`,
  USER_INFO: `${API_BASE_URL}/api/auth/user/`,
};

// User Endpoints
export const USER_ENDPOINTS = {
  GET_PROFILE: `${API_BASE_URL}/api/auth/user/profile/`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/auth/user/profile/`,
  GET_USER: (id: string) => `${API_BASE_URL}/api/auth/user/${id}/`, // Fixed: Use auth endpoint
  GET_USERS: `${API_BASE_URL}/api/auth/users/public/`, // Fixed: Use public endpoint for session scheduling
  UPLOAD_AVATAR: `${API_BASE_URL}/api/auth/user/avatar/`, // Fixed: Use auth endpoint
  UPDATE_SETTINGS: `${API_BASE_URL}/api/auth/user/settings/`, // Fixed: Use auth endpoint
  GET_USER_DETAIL: `${API_BASE_URL}/api/auth/user/`,
  GET_PROFILE_DETAIL: `${API_BASE_URL}/api/auth/profile/`,
};

// Skills Endpoints - Updated to match Django backend
export const SKILL_ENDPOINTS = {
  // Base skills (categories)
  GET_SKILLS: `${API_BASE_URL}/api/skills/all/`, // Fixed: Use the correct endpoint for all skills
  GET_SKILL: (id: string) => `${API_BASE_URL}/api/skills/${id}/`,
  CREATE_SKILL: `${API_BASE_URL}/api/skills/`,
  UPDATE_SKILL: (id: string) => `${API_BASE_URL}/api/skills/${id}/`,
  DELETE_SKILL: (id: string) => `${API_BASE_URL}/api/skills/${id}/`,
  GET_CATEGORIES: `${API_BASE_URL}/api/skills/categories/`,

  // Teaching skills (user's skills they can teach)
  GET_TEACHING_SKILLS: `${API_BASE_URL}/api/skills/teaching/`,
  CREATE_TEACHING_SKILL: `${API_BASE_URL}/api/skills/teaching/`,
  UPDATE_TEACHING_SKILL: (id: string) => `${API_BASE_URL}/api/skills/teaching/${id}/`,
  DELETE_TEACHING_SKILL: (id: string) => `${API_BASE_URL}/api/skills/teaching/${id}/`,

  // Learning skills (user's skills they want to learn)
  GET_LEARNING_SKILLS: `${API_BASE_URL}/api/skills/learning/`,
  CREATE_LEARNING_SKILL: `${API_BASE_URL}/api/skills/learning/`,
  UPDATE_LEARNING_SKILL: (id: string) => `${API_BASE_URL}/api/skills/learning/${id}/`,
  DELETE_LEARNING_SKILL: (id: string) => `${API_BASE_URL}/api/skills/learning/${id}/`,
};

// Session Endpoints
export const SESSION_ENDPOINTS = {
  GET_SESSIONS: `${API_BASE_URL}/api/sessions`,
  GET_SESSION: (id: string) => `${API_BASE_URL}/api/sessions/${id}`,
  CREATE_SESSION: `${API_BASE_URL}/api/sessions`,
  UPDATE_SESSION: (id: string) => `${API_BASE_URL}/api/sessions/${id}`,
  DELETE_SESSION: (id: string) => `${API_BASE_URL}/api/sessions/${id}`,
  REQUEST_SESSION: `${API_BASE_URL}/api/sessions/request`,
  ACCEPT_SESSION: (id: string) => `${API_BASE_URL}/api/sessions/${id}/accept`,
  DECLINE_SESSION: (id: string) => `${API_BASE_URL}/api/sessions/${id}/decline`,
  COMPLETE_SESSION: (id: string) => `${API_BASE_URL}/api/sessions/${id}/complete`,
  CANCEL_SESSION: (id: string) => `${API_BASE_URL}/api/sessions/${id}/cancel`,
  RESCHEDULE_SESSION: (id: string) => `${API_BASE_URL}/api/sessions/${id}/reschedule`,
};

// Message Endpoints
export const MESSAGE_ENDPOINTS = {
  GET_CONVERSATIONS: `${API_BASE_URL}/api/messages/conversations/`,
  GET_CONVERSATION: (id: string) => `${API_BASE_URL}/api/messages/conversations/${id}/`,
  GET_MESSAGES: (conversationId: string) => `${API_BASE_URL}/api/messages/conversations/${conversationId}/messages/`,
  SEND_MESSAGE: `${API_BASE_URL}/api/messages/messages/`,
  MARK_AS_READ: (conversationId: string) => `${API_BASE_URL}/api/messages/conversations/${conversationId}/mark-read/`,
  CREATE_CONVERSATION: `${API_BASE_URL}/api/messages/conversations/with_user/`,
};

// Review Endpoints
export const REVIEW_ENDPOINTS = {
  GET_REVIEWS: (userId: string) => `${API_BASE_URL}/api/reviews/user/${userId}`,
  CREATE_REVIEW: `${API_BASE_URL}/api/reviews`,
  UPDATE_REVIEW: (id: string) => `${API_BASE_URL}/api/reviews/${id}`,
  DELETE_REVIEW: (id: string) => `${API_BASE_URL}/api/reviews/${id}`,
};

// Notification Endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: `${API_BASE_URL}/api/messages/notifications/`,
  MARK_AS_READ: (id: string) => `${API_BASE_URL}/api/messages/notifications/${id}/mark-read/`,
  MARK_ALL_AS_READ: `${API_BASE_URL}/api/messages/notifications/mark-all-read/`,
  GET_UNREAD_COUNTS: `${API_BASE_URL}/api/messages/unread-counts/`,
};

// Blog Endpoints
export const BLOG_ENDPOINTS = {
  GET_POSTS: `${API_BASE_URL}/api/blog/posts`,
  GET_POST: (id: string) => `${API_BASE_URL}/api/blog/posts/${id}`,
  GET_CATEGORIES: `${API_BASE_URL}/api/blog/categories`,
};

// Resource Endpoints
export const RESOURCE_ENDPOINTS = {
  GET_RESOURCES: `${API_BASE_URL}/api/resources`,
  GET_RESOURCE: (id: string) => `${API_BASE_URL}/api/resources/${id}`,
};

// Support Endpoints
export const SUPPORT_ENDPOINTS = {
  SUBMIT_CONTACT: `${API_BASE_URL}/api/support/contact`,
  GET_FAQS: `${API_BASE_URL}/api/support/faqs`,
};

// Skill Swap Request Endpoints
export const SKILL_SWAP_ENDPOINTS = {
  CREATE_REQUEST: `${API_BASE_URL}/api/skill-swap-requests/`,
  MY_REQUESTS: `${API_BASE_URL}/api/skill-swap-requests/my-requests/`,
  UPDATE_REQUEST: `${API_BASE_URL}/api/skill-swap-requests`,
  GET_REQUEST: (id: string) => `${API_BASE_URL}/api/skill-swap-requests/${id}/`,
  ACCEPT_REQUEST: (id: string) => `${API_BASE_URL}/api/skill-swap-requests/${id}/accept/`,
  DECLINE_REQUEST: (id: string) => `${API_BASE_URL}/api/skill-swap-requests/${id}/decline/`,
};

// Dashboard Endpoints
export const DASHBOARD_ENDPOINTS = {
  GET_STATS: `${API_BASE_URL}/api/dashboard/stats`,
  GET_RECOMMENDED_USERS: `${API_BASE_URL}/api/dashboard/recommended-users`,
};

// WebSocket Endpoints
export const WS_BASE_URL = (() => {
  // Use environment variable first
  const wsUrl = import.meta.env.VITE_WS_BASE_URL;
  if (wsUrl) {
    return wsUrl;
  }
  
  // In development, connect directly to backend
  if (import.meta.env.DEV) {
    return 'ws://127.0.0.1:8000';
  }
  
  // Fallback: determine WebSocket URL based on current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = window.location.port;
  return `${protocol}//${host}:${port}`;
})();
export const WEBSOCKET_ENDPOINTS = {
  MESSAGES: `${WS_BASE_URL}/ws/messages/`,
  NOTIFICATIONS: `${WS_BASE_URL}/ws/notifications/`,
};

// Analytics Endpoints
export const ANALYTICS_ENDPOINTS = {
  TRACK_EVENT: `${API_BASE_URL}/api/analytics/event`,
  TRACK_PAGE_VIEW: `${API_BASE_URL}/api/analytics/page-view`,
};
