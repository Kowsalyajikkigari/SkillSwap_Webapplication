/**
 * Voice AI Service for SkillSwap
 * Handles all API communication with the Django voice AI backend
 */

import { apiService } from './api.service';
import type {
  VoiceSession,
  VoiceSessionSummary,
  VoiceSessionDetailResponse,
  VoiceSessionListResponse,
  InitiateVoiceCallRequest,
  InitiateVoiceCallResponse,
  VoiceSessionFilters,
  VoiceSettings,
  VoiceAnalytics,
  VoiceError
} from '../types/voice';

class VoiceService {
  private readonly baseUrl = '/api/voice-ai';
  private readonly DEMO_MODE = import.meta.env.DEV && !import.meta.env.VITE_VOICE_AI_REAL_CALLS;

  /**
   * Initiate a personalized voice AI call with user-specific context
   */
  async initiateCall(request: InitiateVoiceCallRequest): Promise<InitiateVoiceCallResponse> {
    try {
      console.log('🎤 VoiceService: Initiating personalized voice call with request:', request);
      
      const url = `${this.baseUrl}/initiate-call/`;
      console.log('🎤 VoiceService: Constructed URL:', url);
      console.log('🎤 VoiceService: Base URL:', this.baseUrl);

      const response = await apiService.post<InitiateVoiceCallResponse>(
        url,
        request
      );

      console.log('🎤 VoiceService: Voice call initiated successfully:', response);

      // Handle development mode response
      if (response.development_mode) {
        console.log('🧪 VoiceService: Running in development mode - call simulated');
      }

      return response;
    } catch (error: any) {
      console.error('❌ VoiceService: Failed to initiate voice call:', error);
      console.error('❌ VoiceService: Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw this.handleError(error);
    }
  }

  /**
   * Test personalized voice AI functionality with current user data
   */
  async testPersonalizedCall(sessionType: string = 'personalized_assistant'): Promise<InitiateVoiceCallResponse> {
    try {
      console.log('🧪 VoiceService: Testing personalized voice AI functionality');

      // Get user's phone number from profile or use a test number
      const settings = await this.getSettings();
      const phoneNumber = settings.phone_number || '+1234567890'; // Test number

      const request: InitiateVoiceCallRequest = {
        session_type: sessionType,
        phone_number: phoneNumber,
        context: {
          test_mode: true,
          timestamp: new Date().toISOString()
        }
      };

      console.log('🧪 VoiceService: Test call request:', request);

      const response = await this.initiateCall(request);

      console.log('✅ VoiceService: Test call initiated successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ VoiceService: Test call failed:', error);
      throw error;
    }
  }

  /**
   * Get list of voice sessions for the current user
   */
  async getSessions(filters: VoiceSessionFilters = {}): Promise<VoiceSessionListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.session_type) params.append('session_type', filters.session_type);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.page_size) params.append('page_size', filters.page_size.toString());

      const response = await apiService.get<VoiceSessionListResponse>(
        `${this.baseUrl}/sessions?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to get voice sessions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed information about a specific voice session
   */
  async getSessionDetail(sessionId: string): Promise<VoiceSessionDetailResponse> {
    try {
      const response = await apiService.get<VoiceSessionDetailResponse>(
        `${this.baseUrl}/sessions/${sessionId}/`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to get session detail:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get voice analytics for the current user
   */
  async getAnalytics(): Promise<VoiceAnalytics> {
    try {
      const response = await apiService.get<VoiceAnalytics>(
        `${this.baseUrl}/analytics/`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to get voice analytics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user's voice settings
   */
  async getSettings(): Promise<VoiceSettings> {
    try {
      const response = await apiService.get<VoiceSettings>(
        `${this.baseUrl}/settings/`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to get voice settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user's voice settings
   */
  async updateSettings(settings: Partial<VoiceSettings>): Promise<VoiceSettings> {
    try {
      const response = await apiService.patch<VoiceSettings>(
        `${this.baseUrl}/settings/`,
        settings
      );
      return response;
    } catch (error: any) {
      console.error('Failed to update voice settings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancel an active voice session
   */
  async cancelSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post<{ success: boolean; message: string }>(
        `${this.baseUrl}/sessions/${sessionId}/cancel/`
      );
      return response;
    } catch (error: any) {
      console.error('Failed to cancel voice session:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Normalize phone number format (auto-fix common issues)
   */
  normalizePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Auto-fix common Indian number formats
    if (!cleaned.startsWith('+')) {
      // If it starts with 91 and has 12 digits total, it's likely an Indian number
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = '+' + cleaned;
      }
      // If it's 10 digits and doesn't start with 0 or 1, assume it's an Indian local number
      else if (cleaned.length === 10 && !cleaned.startsWith('0') && !cleaned.startsWith('1')) {
        cleaned = '+91' + cleaned;
      }
      // If it's any other format without +, add + prefix
      else if (cleaned.length > 0) {
        cleaned = '+' + cleaned;
      }
    }

    return cleaned;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): { isValid: boolean; message?: string; normalizedNumber?: string } {
    // Use the normalize function to clean up the number
    const cleaned = this.normalizePhoneNumber(phoneNumber);

    // Enhanced validation for international phone numbers including Indian numbers
    // Pattern explanation:
    // ^\+ - Must start with +
    // (?:[1-9]\d{0,3}) - Country code: 1-4 digits, first digit 1-9
    // \d{6,14} - Phone number: 6-14 digits
    const phoneRegex = /^\+(?:[1-9]\d{0,3})\d{6,14}$/;

    if (!phoneRegex.test(cleaned)) {
      return {
        isValid: false,
        message: 'Phone number must be in international format (e.g., +1234567890 or +911234567890)',
        normalizedNumber: cleaned
      };
    }

    // Additional validation for common formats
    if (cleaned.length < 10 || cleaned.length > 17) {
      return {
        isValid: false,
        message: 'Phone number must be between 10-17 digits including country code',
        normalizedNumber: cleaned
      };
    }

    // Specific validation for Indian numbers (+91XXXXXXXXXX)
    if (cleaned.startsWith('+91')) {
      if (cleaned.length !== 13) {
        return {
          isValid: false,
          message: 'Indian phone numbers must be in format +91XXXXXXXXXX (13 digits total)',
          normalizedNumber: cleaned
        };
      }
    }

    return {
      isValid: true,
      normalizedNumber: cleaned
    };
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+1') && cleaned.length === 12) {
      // US/Canada format: +1 (123) 456-7890
      const match = cleaned.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }

    if (cleaned.startsWith('+91') && cleaned.length === 13) {
      // Indian format: +91 XXXXX XXXXX
      const match = cleaned.match(/^\+91(\d{5})(\d{5})$/);
      if (match) {
        return `+91 ${match[1]} ${match[2]}`;
      }
    }

    // International format: +XX XXX XXX XXXX
    if (cleaned.startsWith('+') && cleaned.length > 7) {
      const countryCode = cleaned.slice(0, cleaned.startsWith('+91') ? 3 : 3);
      const number = cleaned.slice(countryCode.length);
      const formatted = number.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3');
      return `${countryCode} ${formatted}`;
    }

    return phoneNumber;
  }

  /**
   * Get voice feature configuration
   */
  getVoiceFeatures() {
    return [
      {
        sessionType: 'skill_discovery' as const,
        title: 'Find Skills by Voice',
        description: 'Tell us what you want to learn and we\'ll find the perfect instructor',
        icon: 'search',
        color: 'blue',
        enabled: true,
        requiresPhone: true
      },
      {
        sessionType: 'availability_check' as const,
        title: 'Check Availability',
        description: 'Ask about instructor availability and schedule preferences',
        icon: 'calendar',
        color: 'green',
        enabled: true,
        requiresPhone: true
      },
      {
        sessionType: 'session_booking' as const,
        title: 'Book Sessions',
        description: 'Book skill-sharing sessions through natural conversation',
        icon: 'phone',
        color: 'purple',
        enabled: true,
        requiresPhone: true
      },
      {
        sessionType: 'session_management' as const,
        title: 'Manage Sessions',
        description: 'View, reschedule, or cancel your existing sessions',
        icon: 'settings',
        color: 'orange',
        enabled: true,
        requiresPhone: true
      },
      {
        sessionType: 'general_inquiry' as const,
        title: 'General Help',
        description: 'Get help with SkillSwap features and how to use the platform',
        icon: 'help',
        color: 'gray',
        enabled: true,
        requiresPhone: true
      }
    ];
  }

  /**
   * Get status display information
   */
  getStatusInfo(status: string) {
    const statusMap = {
      initiated: { label: 'Initiating Call...', color: 'blue', icon: 'phone' },
      in_progress: { label: 'Call in Progress', color: 'green', icon: 'phone-call' },
      completed: { label: 'Call Completed', color: 'gray', icon: 'check' },
      failed: { label: 'Call Failed', color: 'red', icon: 'x' },
      cancelled: { label: 'Call Cancelled', color: 'yellow', icon: 'x-circle' }
    };
    
    return statusMap[status as keyof typeof statusMap] || {
      label: 'Unknown Status',
      color: 'gray',
      icon: 'help'
    };
  }

  /**
   * Handle API errors and convert to VoiceError
   */
  private handleError(error: any): VoiceError {
    const voiceError: VoiceError = {
      code: error.code || 'VOICE_ERROR',
      message: error.message || 'An error occurred with the voice service',
      details: error.response?.data || error,
      timestamp: new Date().toISOString()
    };

    // Handle specific error cases
    if (error.response?.status === 400) {
      voiceError.code = 'VALIDATION_ERROR';
      voiceError.message = 'Invalid request data';
    } else if (error.response?.status === 401) {
      voiceError.code = 'AUTHENTICATION_ERROR';
      voiceError.message = 'Please log in to use voice features';
    } else if (error.response?.status === 403) {
      voiceError.code = 'PERMISSION_ERROR';
      voiceError.message = 'You don\'t have permission to use voice features';
    } else if (error.response?.status === 500) {
      voiceError.code = 'SERVER_ERROR';
      voiceError.message = 'Voice service is temporarily unavailable';
    }

    return voiceError;
  }

  /**
   * Check if voice features are available
   */
  async checkAvailability(): Promise<{ available: boolean; message?: string }> {
    try {
      // Simple health check - try to get sessions
      await this.getSessions({ page_size: 1 });
      return { available: true };
    } catch (error: any) {
      return {
        available: false,
        message: 'Voice features are currently unavailable'
      };
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;
