/**
 * Local Sessions Service
 * 
 * This service handles session-related data storage and retrieval
 * for the SkillSwap application using localStorage.
 */

export interface SessionData {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  skill: string;
  date: string;
  time: string;
  type: string;
  status: string;
  notes?: string;
  location?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
}

export interface SessionRequest {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
  skill: string;
  requestedDate: string;
  requestedTime: string;
  type: string;
  status: string;
  message: string;
}

export interface SessionsData {
  upcoming: SessionData[];
  requests: SessionRequest[];
  past: SessionData[];
}

const SESSIONS_STORAGE_KEY = 'skillswap_sessions_data';

/**
 * Get all sessions data from localStorage
 * @returns Sessions data or default empty structure
 */
export const getSessionsData = (): SessionsData => {
  try {
    const data = localStorage.getItem(SESSIONS_STORAGE_KEY);
    return data ? JSON.parse(data) : {
      upcoming: [],
      requests: [],
      past: []
    };
  } catch (error) {
    console.error('Error getting sessions data:', error);
    return {
      upcoming: [],
      requests: [],
      past: []
    };
  }
};

/**
 * Save sessions data to localStorage
 * @param sessionsData - Sessions data to save
 */
export const saveSessionsData = (sessionsData: SessionsData): void => {
  try {
    console.log('💾 Saving sessions data:', sessionsData);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsData));
    console.log('✅ Sessions data saved successfully');
  } catch (error) {
    console.error('❌ Error saving sessions data:', error);
  }
};

/**
 * Add a new upcoming session
 * @param session - Session to add
 */
export const addUpcomingSession = (session: SessionData): void => {
  const sessionsData = getSessionsData();
  sessionsData.upcoming.push(session);
  saveSessionsData(sessionsData);
};

/**
 * Move session from requests to upcoming
 * @param requestId - ID of the request to accept
 */
export const acceptSessionRequest = (requestId: number): void => {
  const sessionsData = getSessionsData();
  const requestIndex = sessionsData.requests.findIndex(req => req.id === requestId);
  
  if (requestIndex !== -1) {
    const request = sessionsData.requests[requestIndex];
    
    // Convert request to upcoming session
    const newSession: SessionData = {
      id: Date.now(),
      user: request.user,
      skill: request.skill,
      date: "To be scheduled",
      time: "To be scheduled",
      type: request.type,
      status: "confirmed",
      notes: request.message
    };
    
    // Remove from requests and add to upcoming
    sessionsData.requests.splice(requestIndex, 1);
    sessionsData.upcoming.push(newSession);
    
    saveSessionsData(sessionsData);
  }
};

/**
 * Remove session request
 * @param requestId - ID of the request to decline
 */
export const declineSessionRequest = (requestId: number): void => {
  const sessionsData = getSessionsData();
  sessionsData.requests = sessionsData.requests.filter(req => req.id !== requestId);
  saveSessionsData(sessionsData);
};

/**
 * Move session from upcoming to past
 * @param sessionId - ID of the session to complete
 * @param feedback - Optional feedback for the session
 */
export const completeSession = (sessionId: number, feedback?: { rating: number; comment: string }): void => {
  const sessionsData = getSessionsData();
  const sessionIndex = sessionsData.upcoming.findIndex(session => session.id === sessionId);
  
  if (sessionIndex !== -1) {
    const session = sessionsData.upcoming[sessionIndex];
    
    // Move to past sessions with feedback
    const completedSession: SessionData = {
      ...session,
      status: "completed",
      feedback
    };
    
    sessionsData.upcoming.splice(sessionIndex, 1);
    sessionsData.past.push(completedSession);
    
    saveSessionsData(sessionsData);
  }
};

/**
 * Update session feedback
 * @param sessionId - ID of the session
 * @param feedback - Feedback to add
 */
export const updateSessionFeedback = (sessionId: number, feedback: { rating: number; comment: string }): void => {
  const sessionsData = getSessionsData();
  const sessionIndex = sessionsData.past.findIndex(session => session.id === sessionId);
  
  if (sessionIndex !== -1) {
    sessionsData.past[sessionIndex].feedback = feedback;
    saveSessionsData(sessionsData);
  }
};

/**
 * Get upcoming sessions count
 * @returns Number of upcoming sessions
 */
export const getUpcomingSessionsCount = (): number => {
  const sessionsData = getSessionsData();
  return sessionsData.upcoming.length;
};

/**
 * Get pending requests count
 * @returns Number of pending requests
 */
export const getPendingRequestsCount = (): number => {
  const sessionsData = getSessionsData();
  return sessionsData.requests.length;
};

/**
 * Clear all sessions data
 */
export const clearSessionsData = (): void => {
  try {
    localStorage.removeItem(SESSIONS_STORAGE_KEY);
    console.log('🗑️ Sessions data cleared');
  } catch (error) {
    console.error('❌ Error clearing sessions data:', error);
  }
};

export default {
  getSessionsData,
  saveSessionsData,
  addUpcomingSession,
  acceptSessionRequest,
  declineSessionRequest,
  completeSession,
  updateSessionFeedback,
  getUpcomingSessionsCount,
  getPendingRequestsCount,
  clearSessionsData,
};
