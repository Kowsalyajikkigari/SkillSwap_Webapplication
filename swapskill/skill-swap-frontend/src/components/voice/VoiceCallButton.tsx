/**
 * Voice Call Button Component
 * Initiates voice AI calls for different SkillSwap features
 */

import React, { useState } from 'react';
import { Phone, PhoneCall, Mic, Calendar, Search, Settings, HelpCircle, Loader2 } from 'lucide-react';
import { useVoiceCall } from '../../contexts/VoiceContext';
import { voiceService } from '../../services/voiceService';
import type { VoiceCallButtonProps, VoiceSessionType } from '../../types/voice';

const VoiceCallButton: React.FC<VoiceCallButtonProps> = ({
  sessionType,
  phoneNumber,
  skillType,
  contextData = {},
  className = '',
  disabled = false,
  onCallInitiated,
  onError
}) => {
  const { makeCall, isLoading } = useVoiceCall();
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [inputPhone, setInputPhone] = useState(phoneNumber || '');
  const [phoneError, setPhoneError] = useState('');

  // Get feature configuration
  const features = voiceService.getVoiceFeatures();
  const feature = features.find(f => f.sessionType === sessionType);
  
  if (!feature) {
    console.error(`Unknown voice session type: ${sessionType}`);
    return null;
  }

  // Icon mapping
  const iconMap = {
    search: Search,
    calendar: Calendar,
    phone: PhoneCall,
    settings: Settings,
    help: HelpCircle
  };

  const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Phone;

  // Color mapping for Tailwind classes
  const colorMap = {
    blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    gray: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
  };

  const buttonColors = colorMap[feature.color as keyof typeof colorMap] || colorMap.blue;

  const handlePhoneValidation = (phone: string): { isValid: boolean; normalizedPhone?: string } => {
    const validation = voiceService.validatePhoneNumber(phone);
    if (!validation.isValid) {
      setPhoneError(validation.message || 'Invalid phone number');
      return { isValid: false };
    }
    setPhoneError('');
    return {
      isValid: true,
      normalizedPhone: validation.normalizedNumber || phone
    };
  };

  const handleInitiateCall = async () => {
    const phoneToUse = inputPhone || phoneNumber;

    if (!phoneToUse) {
      setShowPhoneInput(true);
      return;
    }

    const validation = handlePhoneValidation(phoneToUse);
    if (!validation.isValid) {
      return;
    }

    // Use the normalized phone number
    const normalizedPhone = validation.normalizedPhone || phoneToUse;

    try {
      console.log('🎤 VoiceCallButton: Initiating call with phone:', normalizedPhone);

      const request = {
        phone_number: normalizedPhone,
        session_type: sessionType,
        skill_type: skillType,
        context_data: {
          ...contextData,
          feature_title: feature.title,
          initiated_from: 'voice_button',
          timestamp: new Date().toISOString()
        }
      };

      console.log('🎤 VoiceCallButton: Call request:', request);

      const response = await makeCall(
        request,
        (response) => {
          console.log('✅ VoiceCallButton: Call initiated successfully:', response);
          setShowPhoneInput(false);
          setPhoneError(''); // Clear any previous errors

          // Show success message to user
          if (response.development_mode) {
            setPhoneError('✅ Voice call simulated successfully! In production, you would receive a real call.');
          } else {
            setPhoneError('✅ Voice call initiated! You should receive a call shortly.');
          }

          onCallInitiated?.(response);
        },
        (error) => {
          console.error('❌ VoiceCallButton: Call failed:', error);

          // Show user-friendly error message
          const errorMessage = error.message || 'Failed to initiate voice call. Please try again.';
          setPhoneError(errorMessage);

          onError?.(error);
        }
      );

    } catch (error) {
      console.error('❌ VoiceCallButton: Voice call failed:', error);
      // Show error to user
      setPhoneError('Failed to initiate call. Please try again.');
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = handlePhoneValidation(inputPhone);
    if (validation.isValid) {
      // Update the input with the normalized number for display
      if (validation.normalizedPhone && validation.normalizedPhone !== inputPhone) {
        setInputPhone(validation.normalizedPhone);
      }
      handleInitiateCall();
    }
  };

  // Phone input modal
  if (showPhoneInput) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Enter Your Phone Number
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We'll call you to start your {feature.title.toLowerCase()} session.
          </p>
          
          <form onSubmit={handlePhoneSubmit}>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={inputPhone}
                onChange={(e) => {
                  setInputPhone(e.target.value);
                  setPhoneError('');
                }}
                placeholder="+1234567890"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  phoneError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {phoneError && (
                <p className={`mt-1 text-sm ${phoneError.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                  {phoneError}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Include country code (e.g., +1 for US/Canada)
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading || !inputPhone.trim()}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-white rounded-md font-medium transition-colors ${buttonColors} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Me
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowPhoneInput(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main button
  return (
    <button
      onClick={handleInitiateCall}
      disabled={disabled || isLoading || !feature.enabled}
      className={`
        inline-flex items-center justify-center px-4 py-2 text-white font-medium rounded-md
        transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
        ${buttonColors}
        ${className}
      `}
      title={isLoading ? 'Initiating call...' : feature.description}
      aria-label={isLoading ? 'Initiating voice call' : feature.title}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <IconComponent className="w-4 h-4 mr-2" />
          {feature.title}
        </>
      )}
    </button>
  );
};

export default VoiceCallButton;
