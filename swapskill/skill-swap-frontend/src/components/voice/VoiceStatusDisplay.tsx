/**
 * Voice Status Display Component
 * Shows the current status of voice calls and sessions
 */

import React, { useEffect, useState } from 'react';
import { 
  Phone, 
  PhoneCall, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import type { VoiceStatusDisplayProps, VoiceCallStatus } from '../../types/voice';

const VoiceStatusDisplay: React.FC<VoiceStatusDisplayProps> = ({
  session,
  status,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Show/hide the status display based on call status
  useEffect(() => {
    if (status !== 'idle') {
      setIsVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      // Hide after animation completes
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [status]);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (status === 'connected' || status === 'in_progress') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Format time elapsed
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status configuration
  const getStatusConfig = (callStatus: VoiceCallStatus) => {
    switch (callStatus) {
      case 'initiating':
        return {
          icon: Phone,
          label: 'Initiating Call...',
          description: 'Setting up your voice session',
          color: 'blue',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          showPulse: true
        };
      
      case 'ringing':
        return {
          icon: Volume2,
          label: 'Calling...',
          description: 'Your phone should be ringing now',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          showPulse: true
        };
      
      case 'connected':
        return {
          icon: PhoneCall,
          label: 'Connected',
          description: 'Voice session is active',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          showTimer: true
        };
      
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Call Completed',
          description: 'Voice session finished successfully',
          color: 'green',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          autoHide: true
        };
      
      case 'failed':
        return {
          icon: XCircle,
          label: 'Call Failed',
          description: 'Unable to connect. Please try again.',
          color: 'red',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          autoHide: true
        };
      
      default:
        return {
          icon: Clock,
          label: 'Idle',
          description: '',
          color: 'gray',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  // Auto-hide for completed/failed states
  useEffect(() => {
    if (config.autoHide) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setIsVisible(false), 300);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [config.autoHide]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${className}`}>
      <div className={`
        max-w-sm rounded-lg border shadow-lg p-4
        ${config.bgColor} ${config.borderColor}
      `}>
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${config.showPulse ? 'animate-pulse' : ''}`}>
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-medium ${config.textColor}`}>
                {config.label}
              </h4>
              
              {/* Timer */}
              {config.showTimer && (
                <span className={`text-sm font-mono ${config.textColor}`}>
                  {formatTime(timeElapsed)}
                </span>
              )}
            </div>
            
            {config.description && (
              <p className={`text-sm ${config.textColor} opacity-75 mt-1`}>
                {config.description}
              </p>
            )}
            
            {/* Session info */}
            {session && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`${config.textColor} opacity-60`}>Session:</span>
                  <span className={`${config.textColor} font-mono`}>
                    {session.session_id.slice(-8)}
                  </span>
                </div>
                
                {session.phone_number && (
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${config.textColor} opacity-60`}>Phone:</span>
                    <span className={`${config.textColor}`}>
                      {voiceService.formatPhoneNumber(session.phone_number)}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <span className={`${config.textColor} opacity-60`}>Type:</span>
                  <span className={`${config.textColor} capitalize`}>
                    {session.session_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}
            
            {/* Call instructions */}
            {status === 'ringing' && (
              <div className={`mt-3 p-2 rounded ${config.bgColor} border ${config.borderColor}`}>
                <p className={`text-xs ${config.textColor}`}>
                  📞 Answer your phone to start the voice session
                </p>
              </div>
            )}
            
            {status === 'connected' && (
              <div className={`mt-3 p-2 rounded ${config.bgColor} border ${config.borderColor}`}>
                <p className={`text-xs ${config.textColor}`}>
                  🎙️ Speak naturally - the AI assistant is listening
                </p>
              </div>
            )}
          </div>
          
          {/* Close button for failed/completed states */}
          {(status === 'failed' || status === 'completed') && (
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(() => setIsVisible(false), 300);
              }}
              className={`flex-shrink-0 ${config.iconColor} hover:opacity-75 transition-opacity`}
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Progress bar for active calls */}
        {(status === 'initiating' || status === 'ringing') && (
          <div className="mt-3">
            <div className={`w-full bg-gray-200 rounded-full h-1`}>
              <div className={`h-1 rounded-full bg-${config.color}-500 animate-pulse`} 
                   style={{ width: '60%' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceStatusDisplay;
