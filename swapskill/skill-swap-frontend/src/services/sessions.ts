import api from './api.service';

export interface SessionRequestData {
  userId: string;
  skillId: string;
  scheduledDate: string;
  duration: number;
  notes: string;
}

export const requestSession = async (data: SessionRequestData) => {
  return await api.post('/api/sessions/requests/', data);
};

export const getUserSessions = async () => {
  return await api.get('/api/sessions/sessions/');
};

export const acceptSession = async (sessionId: number) => {
  return await api.post(`/api/sessions/requests/${sessionId}/accept/`);
};

export const rejectSession = async (sessionId: number) => {
  return await api.post(`/api/sessions/requests/${sessionId}/decline/`);
};

export const completeSession = async (sessionId: number) => {
  return await api.post(`/api/sessions/sessions/${sessionId}/complete/`);
};

export const cancelSession = async (sessionId: number) => {
  return await api.post(`/api/sessions/sessions/${sessionId}/cancel/`);
};

export const getUpcomingSessions = async () => {
  return await api.get('/api/sessions/sessions/upcoming/');
};

export const getSessionRequests = async () => {
  return await api.get('/api/sessions/requests/');
};
