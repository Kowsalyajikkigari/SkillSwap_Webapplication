import React from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, MessageCircle, Globe } from 'lucide-react';

interface AvailabilityStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

const AvailabilityStep: React.FC<AvailabilityStepProps> = ({ formData, updateFormData }) => {
  const responseTimeOptions = [
    { value: 'within_1_hour', label: 'Within 1 hour', description: 'Very responsive' },
    { value: 'within_24_hours', label: 'Within 24 hours', description: 'Standard response' },
    { value: 'within_3_days', label: 'Within 3 days', description: 'Flexible timing' },
    { value: 'flexible', label: 'Flexible', description: 'No specific timeframe' }
  ];

  const communicationMethods = [
    { value: 'platform_messaging', label: 'Platform Messaging', description: 'Built-in chat system' },
    { value: 'email', label: 'Email', description: 'Traditional email communication' },
    { value: 'video_calls', label: 'Video Calls', description: 'Face-to-face sessions' },
    { value: 'phone_calls', label: 'Phone Calls', description: 'Voice communication' }
  ];

  const sessionDurations = [
    { value: '30', label: '30 minutes', description: 'Quick sessions' },
    { value: '60', label: '1 hour', description: 'Standard length' },
    { value: '90', label: '1.5 hours', description: 'Extended sessions' },
    { value: '120', label: '2 hours', description: 'Deep dive sessions' }
  ];

  const updateAvailability = (field: string, value: any) => {
    updateFormData('availability', {
      ...formData.availability,
      [field]: value
    });
  };

  const updateSessionPreferences = (field: string, value: any) => {
    updateFormData('sessionPreferences', {
      ...formData.sessionPreferences,
      [field]: value
    });
  };

  const updateCommunicationStyle = (field: string, value: any) => {
    updateFormData('communicationStyle', {
      ...formData.communicationStyle,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Complete Your Profile</h3>
        <p className="text-muted-foreground mb-4">
          Set your availability and preferences to help others know when and how to connect with you.
        </p>
      </div>

      {/* Availability Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Availability Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Availability Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe Your Availability
            </label>
            <Textarea
              placeholder="e.g., 'Available weekday evenings and weekend mornings. Prefer 1-hour sessions. Can accommodate different time zones.'"
              value={formData.availability.description}
              onChange={(e) => updateAvailability('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Time Preferences */}
          <div>
            <label className="block text-sm font-medium mb-3">When are you typically available?</label>
            <div className="grid grid-cols-2 gap-4">
              {/* Days */}
              <div>
                <p className="text-sm font-medium mb-2">Days</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="weekdays"
                      checked={formData.availability.weekdays}
                      onChange={(e) => updateAvailability('weekdays', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="weekdays" className="text-sm">Weekdays (Mon-Fri)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="weekends"
                      checked={formData.availability.weekends}
                      onChange={(e) => updateAvailability('weekends', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="weekends" className="text-sm">Weekends (Sat-Sun)</label>
                  </div>
                </div>
              </div>

              {/* Times */}
              <div>
                <p className="text-sm font-medium mb-2">Times</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mornings"
                      checked={formData.availability.mornings}
                      onChange={(e) => updateAvailability('mornings', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="mornings" className="text-sm">Mornings (6AM-12PM)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="afternoons"
                      checked={formData.availability.afternoons}
                      onChange={(e) => updateAvailability('afternoons', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="afternoons" className="text-sm">Afternoons (12PM-6PM)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="evenings"
                      checked={formData.availability.evenings}
                      onChange={(e) => updateAvailability('evenings', e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="evenings" className="text-sm">Evenings (6PM-11PM)</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Session Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Types */}
          <div>
            <label className="block text-sm font-medium mb-3">Session Types</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="virtualExchanges"
                  checked={formData.sessionPreferences.virtualExchanges}
                  onChange={(e) => updateSessionPreferences('virtualExchanges', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="virtualExchanges" className="text-sm">Virtual/Online Sessions</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="inPersonExchanges"
                  checked={formData.sessionPreferences.inPersonExchanges}
                  onChange={(e) => updateSessionPreferences('inPersonExchanges', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="inPersonExchanges" className="text-sm">In-Person Sessions</label>
              </div>
            </div>
          </div>

          {/* Session Duration and Group Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Session Duration</label>
              <select
                value={formData.sessionPreferences.preferredDuration}
                onChange={(e) => updateSessionPreferences('preferredDuration', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {sessionDurations.map(duration => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label} - {duration.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Students Per Session</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.sessionPreferences.maxStudentsPerSession}
                onChange={(e) => updateSessionPreferences('maxStudentsPerSession', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Communication Style</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Response Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Typical Response Time</label>
            <select
              value={formData.communicationStyle.responseTime}
              onChange={(e) => updateCommunicationStyle('responseTime', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {responseTimeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Communication Method */}
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Communication Method</label>
            <select
              value={formData.communicationStyle.communicationMethod}
              onChange={(e) => updateCommunicationStyle('communicationMethod', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {communicationMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label} - {method.description}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Profile Summary */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Profile Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Teaching Skills:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.teachingSkills.length > 0 ? (
                  formData.teachingSkills.map((skill: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.skillName} ({skill.level})
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None added</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Learning Goals:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.learningGoals.length > 0 ? (
                  formData.learningGoals.map((goal: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {goal.skillName}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">None added</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityStep;
