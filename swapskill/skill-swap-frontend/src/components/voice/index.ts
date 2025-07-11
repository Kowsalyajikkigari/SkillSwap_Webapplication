/**
 * Voice Components Index
 * Exports all voice AI components for easy importing
 */

export { default as VoiceInterface } from './VoiceInterface';
export { default as VoiceCallButton } from './VoiceCallButton';
export { default as VoiceStatusDisplay } from './VoiceStatusDisplay';
export { default as VoiceSessionHistory } from './VoiceSessionHistory';

// Re-export types for convenience
export type {
  VoiceSession,
  VoiceSessionSummary,
  VoiceInteraction,
  VoiceSessionResult,
  InitiateVoiceCallRequest,
  InitiateVoiceCallResponse,
  VoiceSessionType,
  VoiceSessionStatus,
  VoiceCallStatus,
  VoiceError,
  VoiceSettings,
  VoiceInterfaceProps,
  VoiceCallButtonProps,
  VoiceStatusDisplayProps,
  VoiceSessionHistoryProps
} from '../../types/voice';
