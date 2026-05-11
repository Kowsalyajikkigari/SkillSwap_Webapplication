/**
 * Voice Call Button Integration Tests
 * Tests the improved Voice AI functionality including:
 * - Single-click responsiveness
 * - Personalized AI responses
 * - User authentication
 * - Call connection optimization
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import VoiceCallButton from '../VoiceCallButton';
import { VoiceProvider } from '../../../contexts/VoiceContext';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock the voice service
vi.mock('../../../services/voiceService', () => ({
  voiceService: {
    getVoiceFeatures: vi.fn(() => [
      {
        sessionType: 'skill_discovery',
        title: 'Find Skills by Voice',
        description: 'Tell us what you want to learn and we\'ll find the perfect instructor',
        icon: 'search',
        color: 'blue',
        enabled: true,
        requiresPhone: true
      }
    ]),
    validatePhoneNumber: vi.fn((phone) => ({
      isValid: true,
      normalizedNumber: phone,
      message: ''
    })),
    initiateCall: vi.fn()
  }
}));

// Mock the useVoiceCall hook
vi.mock('../../../contexts/VoiceContext', async () => {
  const actual = await vi.importActual('../../../contexts/VoiceContext');
  return {
    ...actual,
    useVoiceCall: () => ({
      makeCall: vi.fn(),
      isLoading: false,
      error: null,
      clearError: vi.fn()
    })
  };
});

// Mock authenticated user
vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: {
      id: 1,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      profile: {
        level: 5,
        points: 2500,
        sessions_completed: 12,
        average_rating: 4.8
      }
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn()
  })
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>
    <VoiceProvider>
      {children}
    </VoiceProvider>
  </AuthProvider>
);

describe('VoiceCallButton - Improved Functionality', () => {
  let mockMakeCall: any;
  let mockVoiceService: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked services
    const { voiceService } = await import('../../../services/voiceService');
    mockVoiceService = voiceService;

    const { useVoiceCall } = await import('../../../contexts/VoiceContext');
    const voiceCallHook = useVoiceCall();
    mockMakeCall = voiceCallHook.makeCall;
  });

  describe('Button Responsiveness', () => {
    it('should render the voice call button correctly', async () => {
      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            phoneNumber="+1234567890"
            skillType="programming"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Find Skills by Voice');
    });

    it('should show phone input modal when no phone number provided', async () => {
      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            skillType="programming"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show phone input modal
      await waitFor(() => {
        expect(screen.getByText('Enter Your Phone Number')).toBeInTheDocument();
      });
    });

    it('should show loading state during call initiation', async () => {
      mockUseVoiceCall.isLoading = true;

      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            phoneNumber="+1234567890"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
      expect(screen.getByTitle('Initiating call...')).toBeInTheDocument();
    });

    it('should prevent multiple simultaneous calls', async () => {
      mockUseVoiceCall.isLoading = true;

      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            phoneNumber="+1234567890"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      
      // Button should be disabled during loading
      expect(button).toBeDisabled();
      
      // Multiple clicks should not trigger multiple calls
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockMakeCall).not.toHaveBeenCalled();
    });
  });

  describe('User Authentication & Personalization', () => {
    it('should include user context in call request', async () => {
      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            phoneNumber="+1234567890"
            contextData={{
              current_search: 'React',
              page_context: 'find_skills'
            }}
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockMakeCall).toHaveBeenCalledWith(
          expect.objectContaining({
            context_data: expect.objectContaining({
              current_search: 'React',
              page_context: 'find_skills',
              feature_title: 'Find Skills by Voice',
              initiated_from: 'voice_button',
              timestamp: expect.any(String)
            })
          }),
          expect.any(Function),
          expect.any(Function)
        );
      });
    });

    it('should handle phone number validation', async () => {
      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            skillType="programming"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show phone input modal when no phone number provided
      await waitFor(() => {
        expect(screen.getByText('Enter Your Phone Number')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('+1234567890')).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      mockVoiceService.validatePhoneNumber.mockReturnValue({
        isValid: false,
        message: 'Invalid phone number format'
      });

      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            phoneNumber="invalid-phone"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should not make call with invalid phone number
      await waitFor(() => {
        expect(mockMakeCall).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle call initiation errors gracefully', async () => {
      const mockError = new Error('Call failed');
      mockMakeCall.mockRejectedValue(mockError);

      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            phoneNumber="+1234567890"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockMakeCall).toHaveBeenCalled();
      });

      // Error should be logged (we can't easily test console.error in this setup)
      // But the component should not crash
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and accessibility attributes', () => {
      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            phoneNumber="+1234567890"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Find Skills by Voice');
      expect(button).toHaveAttribute('title', expect.stringContaining('Tell us what you want to learn'));
    });

    it('should update accessibility attributes during loading', () => {
      mockUseVoiceCall.isLoading = true;

      render(
        <TestWrapper>
          <VoiceCallButton
            sessionType="skill_discovery"
            phoneNumber="+1234567890"
          />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Initiating voice call');
      expect(button).toHaveAttribute('title', 'Initiating call...');
    });
  });
});
