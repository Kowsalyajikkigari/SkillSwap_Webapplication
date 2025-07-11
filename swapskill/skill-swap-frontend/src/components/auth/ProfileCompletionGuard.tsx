import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getProfileCompletionStatus, 
  shouldRedirectToOnboarding, 
  getNextOnboardingStepUrl,
  getCompletionMessage,
  getCompletionColor,
  getOnboardingProgress
} from '../../services/profile-completion.service';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  requireComplete?: boolean; // If true, requires 100% completion
  allowedRoutes?: string[]; // Routes that don't require profile completion
}

const ProfileCompletionGuard: React.FC<ProfileCompletionGuardProps> = ({ 
  children, 
  requireComplete = false,
  allowedRoutes = ['/profile/create', '/profile/edit', '/settings', '/help', '/logout']
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [completionStatus, setCompletionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      // Check if current route is allowed without completion
      const currentPath = location.pathname;
      const isAllowedRoute = allowedRoutes.some(route => 
        currentPath.startsWith(route)
      );

      if (isAllowedRoute) {
        setIsLoading(false);
        return;
      }

      try {
        const status = await getProfileCompletionStatus();
        setCompletionStatus(status);

        // Determine if we should show completion prompt
        if (requireComplete && !status.is_complete) {
          setShowPrompt(true);
        } else if (!requireComplete && shouldRedirectToOnboarding(status)) {
          setShowPrompt(true);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        // If we can't check completion, allow access but log the error
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileCompletion();
  }, [isAuthenticated, user?.id, requireComplete]); // Removed location.pathname and allowedRoutes to reduce API calls

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking profile status...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, let ProtectedRoute handle it
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // If completion status couldn't be loaded, allow access
  if (!completionStatus) {
    return <>{children}</>;
  }

  // If profile completion is required and not complete, show completion prompt
  if (showPrompt) {
    return <ProfileCompletionPrompt completionStatus={completionStatus} />;
  }

  // If we should redirect to onboarding (for non-required routes)
  if (!requireComplete && shouldRedirectToOnboarding(completionStatus)) {
    const nextStepUrl = getNextOnboardingStepUrl(completionStatus);
    return <Navigate to={nextStepUrl} replace />;
  }

  // Allow access to the protected content
  return <>{children}</>;
};

interface ProfileCompletionPromptProps {
  completionStatus: any;
}

const ProfileCompletionPrompt: React.FC<ProfileCompletionPromptProps> = ({ completionStatus }) => {
  const progress = getOnboardingProgress(completionStatus);
  const completionMessage = getCompletionMessage(completionStatus);
  const completionColor = getCompletionColor(completionStatus);
  const nextStepUrl = getNextOnboardingStepUrl(completionStatus);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {completionStatus.is_complete ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : (
              <Clock className="h-16 w-16 text-orange-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {completionStatus.is_complete 
              ? 'Profile Complete!' 
              : 'Complete Your Profile'
            }
          </CardTitle>
          <CardDescription className="text-lg">
            {completionStatus.is_complete
              ? 'Your SkillSwap profile is ready to go!'
              : 'Help others discover your skills and find the perfect matches'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">
                {completionStatus.completion_percentage}%
              </span>
            </div>
            <Progress 
              value={completionStatus.completion_percentage} 
              className="h-3"
              style={{ 
                '--progress-background': completionColor 
              } as React.CSSProperties}
            />
            <p className="text-sm text-center" style={{ color: completionColor }}>
              {completionMessage}
            </p>
          </div>

          {/* Missing Steps Alert */}
          {!completionStatus.is_complete && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next step:</strong> {completionStatus.next_step?.replace('_', ' ') || 'Complete your profile'}
                <br />
                <span className="text-sm text-muted-foreground">
                  Complete your profile to unlock all SkillSwap features and get better matches.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Completion Benefits */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Why complete your profile?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Get matched with relevant skill exchange partners</li>
              <li>• Showcase your expertise and teaching abilities</li>
              <li>• Access personalized learning recommendations</li>
              <li>• Build trust with detailed profile information</li>
              <li>• Unlock advanced features and priority matching</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1" 
              onClick={() => window.location.href = nextStepUrl}
            >
              {completionStatus.is_complete 
                ? 'Continue to Dashboard' 
                : 'Complete Profile'
              }
            </Button>
            
            {!completionStatus.is_complete && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/dashboard'}
              >
                Skip for Now
              </Button>
            )}
          </div>

          {/* Step Progress Indicators */}
          {!completionStatus.is_complete && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t">
              {['Basic Info', 'Teaching Skills', 'Learning Goals', 'Availability'].map((step, index) => {
                const stepId = ['basic_info', 'teaching_skills', 'learning_goals', 'availability'][index];
                const isCompleted = completionStatus.completed_steps.includes(stepId);
                const isCurrent = completionStatus.next_step === stepId;
                
                return (
                  <div 
                    key={step}
                    className={`text-center p-2 rounded text-xs ${
                      isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : isCurrent 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? '✓' : isCurrent ? '→' : '○'} {step}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletionGuard;
