/**
 * Voice Context for SkillSwap Voice AI
 * Provides global state management for voice features
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { voiceService } from '../services/voiceService';
import { useAuth } from './AuthContext';
import type {
  VoiceContextType,
  VoiceSessionSummary,
  VoiceSession,
  InitiateVoiceCallRequest,
  InitiateVoiceCallResponse,
  VoiceSessionFilters,
  VoiceSettings,
  VoiceError
} from '../types/voice';

// Voice State
interface VoiceState {
  sessions: VoiceSessionSummary[];
  currentSession?: VoiceSession;
  isLoading: boolean;
  error?: string;
  settings: VoiceSettings;
}

// Voice Actions
type VoiceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_SESSIONS'; payload: VoiceSessionSummary[] }
  | { type: 'SET_CURRENT_SESSION'; payload: VoiceSession | undefined }
  | { type: 'ADD_SESSION'; payload: VoiceSessionSummary }
  | { type: 'UPDATE_SESSION'; payload: VoiceSessionSummary }
  | { type: 'SET_SETTINGS'; payload: VoiceSettings }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: VoiceState = {
  sessions: [],
  currentSession: undefined,
  isLoading: false,
  error: undefined,
  settings: {
    phone_number: undefined,
    preferred_voice: 'default',
    auto_answer: false,
    notifications_enabled: true,
    call_history_retention: 30
  }
};

// Reducer
function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
    
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload, isLoading: false };
    
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        isLoading: false
      };
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.session_id === action.payload.session_id ? action.payload : session
        )
      };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    
    default:
      return state;
  }
}

// Create context
const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// Provider component
interface VoiceProviderProps {
  children: React.ReactNode;
}

export function VoiceProvider({ children }: VoiceProviderProps) {
  const [state, dispatch] = useReducer(voiceReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load user's voice settings
  const loadSettings = useCallback(async () => {
    console.log('🎤 VoiceContext loadSettings called - isAuthenticated:', isAuthenticated, 'user:', user?.email);

    if (!isAuthenticated || !user) {
      console.log('🎤 VoiceContext: Skipping settings load - user not authenticated');
      return; // Don't try to load settings if user is not authenticated
    }

    try {
      console.log('🎤 VoiceContext: Loading voice settings for authenticated user');
      const settings = await voiceService.getSettings();
      dispatch({ type: 'SET_SETTINGS', payload: settings });
      console.log('🎤 VoiceContext: Voice settings loaded successfully');
    } catch (error) {
      // Settings not critical, continue without them
      console.warn('🎤 VoiceContext: Failed to load voice settings:', error);
    }
  }, [isAuthenticated, user]);

  // Initialize voice settings when user becomes authenticated
  useEffect(() => {
    console.log('🎤 VoiceContext useEffect triggered - isAuthenticated:', isAuthenticated, 'user:', user?.email);

    // Only load settings if user is authenticated and we haven't loaded them yet
    if (isAuthenticated && user && !state.settings) {
      console.log('🎤 VoiceContext: Loading voice settings for authenticated user');
      loadSettings();
    } else if (!isAuthenticated) {
      console.log('🎤 VoiceContext: User not authenticated, skipping settings load');
    } else if (state.settings) {
      console.log('🎤 VoiceContext: Settings already loaded, skipping');
    }
  }, [isAuthenticated, user, loadSettings, state.settings]);

  // Initiate a voice call
  const initiateCall = useCallback(async (
    request: InitiateVoiceCallRequest
  ): Promise<InitiateVoiceCallResponse> => {
    console.log('🎤 VoiceContext: Initiating voice call for user:', user?.email);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Ensure user is authenticated
      if (!isAuthenticated || !user) {
        throw new Error('User must be authenticated to initiate voice calls');
      }

      // Validate phone number if provided
      if (request.phone_number) {
        const validation = voiceService.validatePhoneNumber(request.phone_number);
        if (!validation.isValid) {
          throw new Error(validation.message);
        }
      }

      console.log('🎤 VoiceContext: Calling voice service with request:', request);
      const response = await voiceService.initiateCall(request);

      if (response.success && response.session_id) {
        // Add new session to the list
        const newSession: VoiceSessionSummary = {
          id: response.session_id,
          session_id: response.session_id,
          user_name: user.firstName || user.email || 'Current User',
          session_type: request.session_type,
          status: 'initiated',
          created_at: new Date().toISOString()
        };

        dispatch({ type: 'ADD_SESSION', payload: newSession });
        console.log('✅ VoiceContext: Voice call initiated successfully');
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to initiate voice call';
      console.error('❌ VoiceContext: Voice call failed:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, [isAuthenticated, user]);

  // Test personalized voice AI functionality
  const testPersonalizedCall = useCallback(async (
    sessionType: string = 'personalized_assistant'
  ): Promise<InitiateVoiceCallResponse> => {
    console.log('🧪 VoiceContext: Testing personalized voice AI for user:', user?.email);

    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to test voice calls');
    }

    try {
      const response = await voiceService.testPersonalizedCall(sessionType);
      console.log('✅ VoiceContext: Personalized voice test completed successfully');
      return response;
    } catch (error: any) {
      console.error('❌ VoiceContext: Personalized voice test failed:', error);
      throw error;
    }
  }, [isAuthenticated, user]);

  // Get voice sessions
  const getSessions = useCallback(async (filters: VoiceSessionFilters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await voiceService.getSessions(filters);
      dispatch({ type: 'SET_SESSIONS', payload: response.sessions });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load voice sessions';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  // Get session detail
  const getSessionDetail = useCallback(async (sessionId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await voiceService.getSessionDetail(sessionId);
      dispatch({ type: 'SET_CURRENT_SESSION', payload: response.session });
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load session details';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (newSettings: Partial<VoiceSettings>) => {
    try {
      const updatedSettings = await voiceService.updateSettings(newSettings);
      dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update voice settings';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Context value
  const contextValue: VoiceContextType = {
    // State
    sessions: state.sessions,
    currentSession: state.currentSession,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    initiateCall,
    getSessions,
    getSessionDetail,
    clearError,
    testPersonalizedCall,

    // Settings
    settings: state.settings,
    updateSettings
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
}

// Hook to use voice context
export function useVoice(): VoiceContextType {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}

// Hook for voice call initiation with error handling
export function useVoiceCall() {
  const { initiateCall, isLoading, error, clearError } = useVoice();

  const makeCall = useCallback(async (
    request: InitiateVoiceCallRequest,
    onSuccess?: (response: InitiateVoiceCallResponse) => void,
    onError?: (error: VoiceError) => void
  ) => {
    try {
      clearError();
      const response = await initiateCall(request);
      
      if (response.success) {
        onSuccess?.(response);
      } else {
        const voiceError: VoiceError = {
          code: 'CALL_FAILED',
          message: response.message || 'Failed to initiate call',
          details: response,
          timestamp: new Date().toISOString()
        };
        onError?.(voiceError);
      }
      
      return response;
    } catch (error: any) {
      const voiceError: VoiceError = {
        code: error.code || 'CALL_ERROR',
        message: error.message || 'An error occurred',
        details: error,
        timestamp: new Date().toISOString()
      };
      onError?.(voiceError);
      throw voiceError;
    }
  }, [initiateCall, clearError]);

  return {
    makeCall,
    isLoading,
    error,
    clearError
  };
}

export default VoiceContext;
