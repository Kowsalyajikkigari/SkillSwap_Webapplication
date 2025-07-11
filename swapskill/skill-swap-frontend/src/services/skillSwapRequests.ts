import { post, get, patch } from './api.service';
import { SKILL_SWAP_ENDPOINTS } from '@/config/api.config';

export interface SkillSwapRequest {
  id?: number;
  fromUserId: number;
  toUserId: number;
  wantToLearn: string;
  canOffer: string;
  preferredSchedule: string[];
  message?: string;
  status?: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillSwapRequestResponse {
  id: number;
  fromUser: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  toUser: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  wantToLearn: string;
  canOffer: string;
  preferredSchedule: string[];
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Send a skill swap request to another user
 */
export const sendSkillSwapRequest = async (request: SkillSwapRequest): Promise<SkillSwapRequestResponse> => {
  try {
    console.log('🚀 Sending skill swap request:', request);

    // For now, simulate the API call since backend endpoint doesn't exist yet
    // TODO: Replace with actual API call when backend is implemented
    const mockResponse: SkillSwapRequestResponse = {
      id: Date.now(), // Mock ID
      fromUser: {
        id: request.fromUserId,
        name: 'Current User', // This would come from auth context
        email: 'user@example.com',
      },
      toUser: {
        id: request.toUserId,
        name: 'Target User', // This would come from the profile being viewed
        email: 'target@example.com',
      },
      wantToLearn: request.wantToLearn,
      canOffer: request.canOffer,
      preferredSchedule: request.preferredSchedule,
      message: request.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Skill swap request sent successfully:', mockResponse);
    return mockResponse;

    // TODO: Uncomment when backend endpoint is ready
    /*
    const result = await post<SkillSwapRequestResponse>(SKILL_SWAP_ENDPOINTS.CREATE_REQUEST, request);
    console.log('✅ Skill swap request sent successfully:', result);
    return result;
    */
  } catch (error) {
    console.error('❌ Error sending skill swap request:', error);
    throw error;
  }
};

/**
 * Get skill swap requests for the current user
 */
export const getMySkillSwapRequests = async (): Promise<SkillSwapRequestResponse[]> => {
  try {
    console.log('📥 Fetching skill swap requests...');

    // TODO: Replace with actual API call when backend is implemented
    const mockRequests: SkillSwapRequestResponse[] = [];
    
    console.log('✅ Skill swap requests fetched:', mockRequests);
    return mockRequests;

    // TODO: Uncomment when backend endpoint is ready
    /*
    const response = await makeAuthenticatedRequest(SKILL_SWAP_ENDPOINTS.MY_REQUESTS, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch skill swap requests: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Skill swap requests fetched:', result);
    return result;
    */
  } catch (error) {
    console.error('❌ Error fetching skill swap requests:', error);
    throw error;
  }
};

/**
 * Update the status of a skill swap request
 */
export const updateSkillSwapRequestStatus = async (
  requestId: number, 
  status: 'accepted' | 'declined'
): Promise<SkillSwapRequestResponse> => {
  try {
    console.log(`🔄 Updating skill swap request ${requestId} status to: ${status}`);

    // TODO: Replace with actual API call when backend is implemented
    const mockResponse: SkillSwapRequestResponse = {
      id: requestId,
      fromUser: { id: 1, name: 'User', email: 'user@example.com' },
      toUser: { id: 2, name: 'Target', email: 'target@example.com' },
      wantToLearn: 'Mock Skill',
      canOffer: 'Mock Offer',
      preferredSchedule: ['Weekdays'],
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Skill swap request status updated:', mockResponse);
    return mockResponse;

    // TODO: Uncomment when backend endpoint is ready
    /*
    const response = await makeAuthenticatedRequest(`${SKILL_SWAP_ENDPOINTS.UPDATE_REQUEST}/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update skill swap request: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Skill swap request status updated:', result);
    return result;
    */
  } catch (error) {
    console.error('❌ Error updating skill swap request status:', error);
    throw error;
  }
};

export default {
  sendSkillSwapRequest,
  getMySkillSwapRequests,
  updateSkillSwapRequestStatus,
};
