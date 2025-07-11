import api from './api';

export interface SessionRequestData {
  userId: string;
  skillId: string;
  scheduledDate: string;
  duration: number;
  notes: string;
}

export const requestSession = async (data: SessionRequestData) => {
  return await api.post('/sessions/request/', data);
};

export const getUserSessions = async () => {
  return await api.get('/sessions/user/');
};

export const acceptSession = async (sessionId: number) => {
  return await api.post(`/sessions/${sessionId}/accept/`);
};

export const rejectSession = async (sessionId: number) => {
  return await api.post(`/sessions/${sessionId}/reject/`);
};

export const completeSession = async (sessionId: number) => {
  return await api.post(`/sessions/${sessionId}/complete/`);
};
