/**
 * TypeScript types for SkillSwap Voice AI integration
 */

export interface VoiceSession {
  id: string;
  session_id: string;
  user: number;
  user_name: string;
  user_email: string;
  call_sid?: string;
  ultravox_call_id?: string;
  phone_number: string;
  session_type: VoiceSessionType;
  status: VoiceSessionStatus;
  conversation_data: Record<string, any>;
  ai_response_count: number;
  user_input_count: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
  duration_seconds?: number;
  duration_formatted?: string;
  interactions_count: number;
}

export interface VoiceInteraction {
  id: string;
  voice_session: string;
  session_id: string;
  interaction_type: VoiceInteractionType;
  sequence_number: number;
  user_input: string;
  ai_response: string;
  system_action: string;
  metadata: Record<string, any>;
  confidence_score?: number;
  processing_time_ms?: number;
  timestamp: string;
}

export interface VoiceSessionResult {
  id: string;
  voice_session: string;
  session_id: string;
  session_type: VoiceSessionType;
  result_type: VoiceResultType;
  success: boolean;
  skills_found: any[];
  sessions_booked: any[];
  availability_data: Record<string, any>;
  summary: string;
  follow_up_required: boolean;
  follow_up_notes: string;
  created_at: string;
}

export interface VoiceSessionSummary {
  id: string;
  session_id: string;
  user_name: string;
  session_type: VoiceSessionType;
  status: VoiceSessionStatus;
  created_at: string;
  completed_at?: string;
  duration_formatted?: string;
  result_summary?: string;
  success?: boolean;
}

export interface InitiateVoiceCallRequest {
  phone_number: string;
  session_type: VoiceSessionType;
  skill_type?: string;
  context_data?: Record<string, any>;
}

export interface InitiateVoiceCallResponse {
  success: boolean;
  session_id?: string;
  call_sid?: string;
  message: string;
  session_type?: VoiceSessionType;
  error?: string;
  details?: any;
}

export interface VoiceSessionListResponse {
  sessions: VoiceSessionSummary[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    has_next: boolean;
  };
}

export interface VoiceSessionDetailResponse {
  session: VoiceSession;
  interactions: VoiceInteraction[];
  result?: VoiceSessionResult;
}

// Enums
export type VoiceSessionType = 
  | 'skill_discovery'
  | 'availability_check'
  | 'session_booking'
  | 'session_management'
  | 'profile_update'
  | 'general_inquiry';

export type VoiceSessionStatus = 
  | 'initiated'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type VoiceInteractionType = 
  | 'user_input'
  | 'ai_response'
  | 'system_action'
  | 'api_call'
  | 'booking_attempt'
  | 'skill_search'
  | 'availability_check';

export type VoiceResultType = 
  | 'skill_found'
  | 'session_booked'
  | 'availability_provided'
  | 'profile_updated'
  | 'information_provided'
  | 'no_action'
  | 'error_occurred';

// Voice UI State Types
export interface VoiceUIState {
  isCallActive: boolean;
  currentSession?: VoiceSession;
  callStatus: VoiceCallStatus;
  error?: string;
  isLoading: boolean;
}

export type VoiceCallStatus = 
  | 'idle'
  | 'initiating'
  | 'ringing'
  | 'connected'
  | 'completed'
  | 'failed';

// Voice Feature Configuration
export interface VoiceFeatureConfig {
  sessionType: VoiceSessionType;
  title: string;
  description: string;
  icon: string;
  color: string;
  enabled: boolean;
  requiresPhone: boolean;
}

// Voice Analytics
export interface VoiceAnalytics {
  total_sessions: number;
  successful_sessions: number;
  average_duration: number;
  most_used_feature: VoiceSessionType;
  recent_sessions: VoiceSessionSummary[];
}

// Error Types
export interface VoiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Voice Settings
export interface VoiceSettings {
  phone_number?: string;
  preferred_voice?: string;
  auto_answer?: boolean;
  notifications_enabled: boolean;
  call_history_retention: number; // days
}

// Voice Context for React Context API
export interface VoiceContextType {
  // State
  sessions: VoiceSessionSummary[];
  currentSession?: VoiceSession;
  isLoading: boolean;
  error?: string;
  
  // Actions
  initiateCall: (request: InitiateVoiceCallRequest) => Promise<InitiateVoiceCallResponse>;
  getSessions: (filters?: VoiceSessionFilters) => Promise<void>;
  getSessionDetail: (sessionId: string) => Promise<VoiceSessionDetailResponse>;
  clearError: () => void;
  testPersonalizedCall: (sessionType?: string) => Promise<InitiateVoiceCallResponse>;
  
  // Settings
  settings: VoiceSettings;
  updateSettings: (settings: Partial<VoiceSettings>) => Promise<void>;
}

export interface VoiceSessionFilters {
  session_type?: VoiceSessionType;
  status?: VoiceSessionStatus;
  page?: number;
  page_size?: number;
}

// Component Props Types
export interface VoiceCallButtonProps {
  sessionType: VoiceSessionType;
  phoneNumber?: string;
  skillType?: string;
  contextData?: Record<string, any>;
  className?: string;
  disabled?: boolean;
  onCallInitiated?: (response: InitiateVoiceCallResponse) => void;
  onError?: (error: VoiceError) => void;
}

export interface VoiceStatusDisplayProps {
  session?: VoiceSession;
  status: VoiceCallStatus;
  className?: string;
}

export interface VoiceSessionHistoryProps {
  sessions: VoiceSessionSummary[];
  onSessionSelect?: (session: VoiceSessionSummary) => void;
  className?: string;
}

export interface VoiceInterfaceProps {
  userId: number;
  userPhone?: string;
  className?: string;
  features?: VoiceSessionType[];
}
