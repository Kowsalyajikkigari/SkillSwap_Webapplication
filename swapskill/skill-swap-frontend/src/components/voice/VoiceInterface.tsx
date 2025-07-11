/**
 * Main Voice Interface Component
 * Central hub for all voice AI features in SkillSwap
 */

import React, { useState, useEffect } from 'react';
import { Mic, Phone, Settings, History, X } from 'lucide-react';
import { useVoice } from '../../contexts/VoiceContext';
import { voiceService } from '../../services/voiceService';
import VoiceCallButton from './VoiceCallButton';
import VoiceStatusDisplay from './VoiceStatusDisplay';
import VoiceSessionHistory from './VoiceSessionHistory';
import type { 
  VoiceInterfaceProps, 
  VoiceSessionType, 
  VoiceCallStatus,
  InitiateVoiceCallResponse,
  VoiceError,
  VoiceSessionSummary
} from '../../types/voice';

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  userId,
  userPhone,
  className = '',
  features = ['skill_discovery', 'availability_check', 'session_booking', 'session_management', 'general_inquiry']
}) => {
  const { sessions, getSessions, settings, updateSettings } = useVoice();
  const [currentCallStatus, setCurrentCallStatus] = useState<VoiceCallStatus>('idle');
  const [currentSession, setCurrentSession] = useState<any>(undefined);
  const [activeTab, setActiveTab] = useState<'features' | 'history' | 'settings'>('features');
  const [showInterface, setShowInterface] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(userPhone || settings.phone_number || '');

  // Load sessions on mount
  useEffect(() => {
    getSessions();
  }, []);

  // Update phone number when settings change
  useEffect(() => {
    if (settings.phone_number && !phoneNumber) {
      setPhoneNumber(settings.phone_number);
    }
  }, [settings.phone_number]);

  // Handle call initiation
  const handleCallInitiated = (response: InitiateVoiceCallResponse) => {
    if (response.success) {
      setCurrentCallStatus('initiating');
      // Simulate call progression (in real app, this would come from webhooks)
      setTimeout(() => setCurrentCallStatus('ringing'), 2000);
      setTimeout(() => setCurrentCallStatus('connected'), 8000);
      setTimeout(() => setCurrentCallStatus('completed'), 30000);
    }
  };

  // Handle call errors
  const handleCallError = (error: VoiceError) => {
    setCurrentCallStatus('failed');
    console.error('Voice call error:', error);
  };

  // Handle session selection from history
  const handleSessionSelect = (session: VoiceSessionSummary) => {
    // Could open a detailed view or perform other actions
    console.log('Selected session:', session);
  };

  // Save phone number to settings
  const handleSavePhoneNumber = async () => {
    try {
      await updateSettings({ phone_number: phoneNumber });
    } catch (error) {
      console.error('Failed to save phone number:', error);
    }
  };

  // Get available voice features
  const voiceFeatures = voiceService.getVoiceFeatures().filter(
    feature => features.includes(feature.sessionType)
  );

  return (
    <>
      {/* Voice Interface Toggle Button */}
      <button
        onClick={() => setShowInterface(true)}
        className={`
          fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 
          text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 
          transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${className}
        `}
        title="Open Voice Assistant"
      >
        <Mic className="w-6 h-6 mx-auto" />
      </button>

      {/* Voice Status Display */}
      <VoiceStatusDisplay
        session={currentSession}
        status={currentCallStatus}
      />

      {/* Voice Interface Modal */}
      {showInterface && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Voice Assistant</h2>
                    <p className="text-blue-100 text-sm">Powered by AI for natural conversations</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowInterface(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-4 flex space-x-1">
                {[
                  { id: 'features', label: 'Voice Features', icon: Phone },
                  { id: 'history', label: 'History', icon: History },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                        ${activeTab === tab.id 
                          ? 'bg-white text-blue-600' 
                          : 'text-blue-100 hover:bg-white hover:bg-opacity-20'
                        }
                      `}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Voice Features Tab */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      What would you like to do?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Choose a voice feature below. We'll call you and guide you through a natural conversation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {voiceFeatures.map(feature => (
                      <div
                        key={feature.sessionType}
                        className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="mb-4">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {feature.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4">
                            {feature.description}
                          </p>
                        </div>
                        
                        <VoiceCallButton
                          sessionType={feature.sessionType}
                          phoneNumber={phoneNumber}
                          onCallInitiated={handleCallInitiated}
                          onError={handleCallError}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Phone Number Input */}
                  {!phoneNumber && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        Phone Number Required
                      </h4>
                      <p className="text-sm text-yellow-700 mb-3">
                        Please add your phone number to use voice features.
                      </p>
                      <div className="flex space-x-2">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1234567890"
                          className="flex-1 px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleSavePhoneNumber}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <VoiceSessionHistory
                  sessions={sessions}
                  onSessionSelect={handleSessionSelect}
                />
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Voice Settings
                    </h3>
                    <p className="text-gray-600">
                      Configure your voice assistant preferences.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1234567890"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleSavePhoneNumber}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Include country code (e.g., +1 for US/Canada)
                      </p>
                    </div>

                    {/* Notifications */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Voice Notifications
                        </label>
                        <p className="text-sm text-gray-500">
                          Get notified about voice session updates
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications_enabled}
                        onChange={(e) => updateSettings({ notifications_enabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceInterface;
