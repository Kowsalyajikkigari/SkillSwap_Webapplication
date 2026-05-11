/**
 * Voice Session History Component
 * Displays a list of past voice AI sessions
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Calendar,
  Settings,
  HelpCircle,
  ChevronRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useVoice } from '../../contexts/VoiceContext';
import { voiceService } from '../../services/voiceService';
import type { 
  VoiceSessionHistoryProps, 
  VoiceSessionSummary, 
  VoiceSessionType,
  VoiceSessionStatus 
} from '../../types/voice';

const VoiceSessionHistory: React.FC<VoiceSessionHistoryProps> = ({
  sessions,
  onSessionSelect,
  className = ''
}) => {
  const { getSessions, isLoading } = useVoice();
  const [filter, setFilter] = useState<{
    type?: VoiceSessionType;
    status?: VoiceSessionStatus;
  }>({});
  const [showFilters, setShowFilters] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    if (sessions.length === 0) {
      getSessions();
    }
  }, []);

  // Refresh sessions
  const handleRefresh = () => {
    getSessions(filter);
  };

  // Apply filters
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    getSessions(newFilter);
  };

  // Get icon for session type
  const getSessionTypeIcon = (type: VoiceSessionType) => {
    const iconMap = {
      skill_discovery: Search,
      availability_check: Calendar,
      session_booking: Phone,
      session_management: Settings,
      profile_update: Settings,
      general_inquiry: HelpCircle
    };
    return iconMap[type] || Phone;
  };

  // Get status icon and color
  const getStatusConfig = (status: VoiceSessionStatus) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
      case 'in_progress':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'cancelled':
        return { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // Format session type for display
  const formatSessionType = (type: VoiceSessionType): string => {
    const typeMap = {
      skill_discovery: 'Skill Discovery',
      availability_check: 'Availability Check',
      session_booking: 'Session Booking',
      session_management: 'Session Management',
      profile_update: 'Profile Update',
      general_inquiry: 'General Help'
    };
    return typeMap[type] || type;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Voice Session History</h3>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Filter sessions"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type
                </label>
                <select
                  value={filter.type || ''}
                  onChange={(e) => handleFilterChange({ 
                    ...filter, 
                    type: e.target.value as VoiceSessionType || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="skill_discovery">Skill Discovery</option>
                  <option value="availability_check">Availability Check</option>
                  <option value="session_booking">Session Booking</option>
                  <option value="session_management">Session Management</option>
                  <option value="general_inquiry">General Help</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filter.status || ''}
                  onChange={(e) => handleFilterChange({ 
                    ...filter, 
                    status: e.target.value as VoiceSessionStatus || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session List */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="px-6 py-8 text-center">
            <RefreshCw className="w-6 h-6 mx-auto text-gray-400 animate-spin mb-2" />
            <p className="text-gray-500">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Phone className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Voice Sessions Yet</h4>
            <p className="text-gray-500">
              Start using voice features to see your session history here.
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const TypeIcon = getSessionTypeIcon(session.session_type);
            const statusConfig = getStatusConfig(session.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={session.id}
                onClick={() => onSessionSelect?.(session)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Session Type Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {formatSessionType(session.session_type)}
                        </h4>
                        
                        {/* Status Badge */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {session.status}
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(session.created_at)}</span>
                        
                        {session.duration_formatted && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {session.duration_formatted}
                          </span>
                        )}
                      </div>
                      
                      {session.result_summary && (
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          {session.result_summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {sessions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => getSessions({ ...filter, page: 2 })}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Load More Sessions
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceSessionHistory;
