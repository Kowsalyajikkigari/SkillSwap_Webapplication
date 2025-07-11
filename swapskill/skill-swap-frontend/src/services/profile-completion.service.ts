import { get } from './api.service';
import { API_BASE_URL } from '../config/api.config';

export interface ProfileCompletionStatus {
  is_complete: boolean;
  completion_percentage: number;
  completed_steps: string[];
  missing_fields: string[];
  next_step: string | null;
  required_steps: string[];
  profile_data: {
    bio: string;
    location: string;
    avatar: string | null;
    first_name: string;
    last_name: string;
  };
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  completed: boolean;
}

/**
 * Get user's profile completion status
 * @returns Promise with profile completion data
 */
export const getProfileCompletionStatus = async (): Promise<ProfileCompletionStatus> => {
  try {
    const response = await get<ProfileCompletionStatus>(`${API_BASE_URL}/api/auth/profile/completion-status/`);
    return response;
  } catch (error) {
    console.error('Error fetching profile completion status:', error);
    throw error;
  }
};

/**
 * Get onboarding steps with completion status
 * @param completionStatus - Current completion status
 * @returns Array of onboarding steps
 */
export const getOnboardingSteps = (completionStatus: ProfileCompletionStatus): OnboardingStep[] => {
  const steps: OnboardingStep[] = [
    {
      id: 'basic_info',
      title: 'Basic Information',
      description: 'Complete your profile with bio, location, and personal details',
      icon: 'user',
      required: true,
      completed: completionStatus.completed_steps.includes('basic_info')
    },
    {
      id: 'teaching_skills',
      title: 'Teaching Skills',
      description: 'Add skills you can teach and share with others',
      icon: 'book',
      required: true,
      completed: completionStatus.completed_steps.includes('teaching_skills')
    },
    {
      id: 'learning_goals',
      title: 'Learning Goals',
      description: 'Specify what skills you want to learn',
      icon: 'target',
      required: true,
      completed: completionStatus.completed_steps.includes('learning_goals')
    },
    {
      id: 'availability',
      title: 'Availability & Preferences',
      description: 'Set your availability and session preferences',
      icon: 'calendar',
      required: false,
      completed: completionStatus.completed_steps.includes('availability')
    }
  ];

  return steps;
};

/**
 * Check if user should be redirected to onboarding
 * @param completionStatus - Current completion status
 * @returns Boolean indicating if onboarding is needed
 */
export const shouldRedirectToOnboarding = (completionStatus: ProfileCompletionStatus): boolean => {
  // Redirect if profile is not complete (less than 100%)
  return !completionStatus.is_complete;
};

/**
 * Get the next onboarding step URL
 * @param completionStatus - Current completion status
 * @returns URL for the next onboarding step
 */
export const getNextOnboardingStepUrl = (completionStatus: ProfileCompletionStatus): string => {
  const nextStep = completionStatus.next_step;
  
  switch (nextStep) {
    case 'basic_info':
      return '/profile/create?step=1';
    case 'teaching_skills':
      return '/profile/create?step=2';
    case 'learning_goals':
      return '/profile/create?step=3';
    case 'availability':
      return '/profile/create?step=4';
    default:
      return '/profile/create?step=1';
  }
};

/**
 * Get completion status message for UI
 * @param completionStatus - Current completion status
 * @returns User-friendly completion message
 */
export const getCompletionMessage = (completionStatus: ProfileCompletionStatus): string => {
  const percentage = completionStatus.completion_percentage;
  
  if (percentage === 100) {
    return 'Your profile is complete! 🎉';
  } else if (percentage >= 75) {
    return `Almost there! ${percentage}% complete`;
  } else if (percentage >= 50) {
    return `Good progress! ${percentage}% complete`;
  } else if (percentage >= 25) {
    return `Getting started! ${percentage}% complete`;
  } else {
    return `Let's complete your profile! ${percentage}% complete`;
  }
};

/**
 * Get completion status color for UI
 * @param completionStatus - Current completion status
 * @returns CSS color class or hex color
 */
export const getCompletionColor = (completionStatus: ProfileCompletionStatus): string => {
  const percentage = completionStatus.completion_percentage;
  
  if (percentage === 100) {
    return '#10B981'; // green
  } else if (percentage >= 75) {
    return '#3B82F6'; // blue
  } else if (percentage >= 50) {
    return '#F59E0B'; // yellow
  } else {
    return '#EF4444'; // red
  }
};

/**
 * Check if a specific step is accessible
 * @param stepId - Step identifier
 * @param completionStatus - Current completion status
 * @returns Boolean indicating if step can be accessed
 */
export const isStepAccessible = (stepId: string, completionStatus: ProfileCompletionStatus): boolean => {
  const steps = ['basic_info', 'teaching_skills', 'learning_goals', 'availability'];
  const stepIndex = steps.indexOf(stepId);
  
  if (stepIndex === -1) return false;
  if (stepIndex === 0) return true; // First step is always accessible
  
  // Check if previous step is completed
  const previousStep = steps[stepIndex - 1];
  return completionStatus.completed_steps.includes(previousStep);
};

/**
 * Get step number from step ID
 * @param stepId - Step identifier
 * @returns Step number (1-based)
 */
export const getStepNumber = (stepId: string): number => {
  const steps = ['basic_info', 'teaching_skills', 'learning_goals', 'availability'];
  return steps.indexOf(stepId) + 1;
};

/**
 * Get step ID from step number
 * @param stepNumber - Step number (1-based)
 * @returns Step identifier
 */
export const getStepId = (stepNumber: number): string => {
  const steps = ['basic_info', 'teaching_skills', 'learning_goals', 'availability'];
  return steps[stepNumber - 1] || 'basic_info';
};

/**
 * Calculate overall onboarding progress
 * @param completionStatus - Current completion status
 * @returns Progress object with current step and total steps
 */
export const getOnboardingProgress = (completionStatus: ProfileCompletionStatus) => {
  const totalSteps = 4;
  const completedRequiredSteps = completionStatus.completed_steps.filter(step => 
    ['basic_info', 'teaching_skills', 'learning_goals'].includes(step)
  ).length;
  
  return {
    currentStep: completedRequiredSteps + 1,
    totalSteps,
    percentage: Math.round((completedRequiredSteps / 3) * 100), // Only count required steps
    isComplete: completionStatus.is_complete
  };
};

export default {
  getProfileCompletionStatus,
  getOnboardingSteps,
  shouldRedirectToOnboarding,
  getNextOnboardingStepUrl,
  getCompletionMessage,
  getCompletionColor,
  isStepAccessible,
  getStepNumber,
  getStepId,
  getOnboardingProgress
};
