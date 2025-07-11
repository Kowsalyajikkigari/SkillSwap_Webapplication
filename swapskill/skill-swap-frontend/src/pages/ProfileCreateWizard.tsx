import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Book,
  Target,
  Calendar,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  MapPin,
  FileText,
  Plus,
  X
} from 'lucide-react';
import LearningGoalsStep from '../components/onboarding/LearningGoalsStep';
import AvailabilityStep from '../components/onboarding/AvailabilityStep';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { 
  getProfileCompletionStatus, 
  getOnboardingSteps, 
  getStepNumber, 
  getStepId,
  isStepAccessible 
} from '../services/profile-completion.service';
import { submitProfileData, validateFormData, validateStepData, calculateCompletionPercentage, removeDuplicateSkills, type OnboardingFormData } from '../services/onboarding.service';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

const ProfileCreateWizard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refreshProfileStatus } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completionStatus, setCompletionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    bio: '',
    location: '',
    avatar: null as File | null,
    contactPreferences: {
      showEmail: false,
      showPhone: false,
      profileVisibility: true
    },

    // Teaching Skills
    teachingSkills: [] as Array<{
      skillId: number;
      skillName: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      yearsExperience: number;
      description: string;
      teachingMethods: string[];
      availableForTeaching: boolean;
    }>,

    // Learning Goals
    learningGoals: [] as Array<{
      skillId: number;
      skillName: string;
      currentLevel: 'beginner' | 'intermediate' | 'advanced';
      goal: string;
      timeline: string;
      learningPreferences: string[];
    }>,

    // Complete Profile
    availability: {
      description: '',
      weekdays: true,
      weekends: true,
      mornings: false,
      afternoons: true,
      evenings: true
    },
    sessionPreferences: {
      virtualExchanges: true,
      inPersonExchanges: true,
      preferredDuration: '60',
      maxStudentsPerSession: 1
    },
    communicationStyle: {
      responseTime: 'within_24_hours',
      communicationMethod: 'platform_messaging',
      languagePreferences: ['English']
    }
  });

  // Load completion status on mount
  useEffect(() => {
    const loadCompletionStatus = async () => {
      try {
        // First, try to restore form data from localStorage
        try {
          const savedData = localStorage.getItem('skillswap_profile_draft');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log('📂 Restored form data from localStorage:', parsedData);
            setFormData(prev => ({
              ...prev,
              ...parsedData
            }));
          }
        } catch (error) {
          console.warn('Failed to restore form data from localStorage:', error);
        }

        const status = await getProfileCompletionStatus();
        setCompletionStatus(status);

        // Set form data from existing profile (but don't override localStorage data)
        setFormData(prev => ({
          ...prev,
          bio: prev.bio || status.profile_data.bio || '',
          location: prev.location || status.profile_data.location || '',
        }));

        // Get step from URL params
        const stepParam = searchParams.get('step');
        if (stepParam) {
          const stepNumber = parseInt(stepParam);
          if (stepNumber >= 1 && stepNumber <= 4) {
            setCurrentStep(stepNumber);
          }
        } else {
          // Default to next incomplete step
          const nextStepId = status.next_step || 'basic_info';
          const nextStepNumber = getStepNumber(nextStepId);
          setCurrentStep(nextStepNumber);
        }
      } catch (error) {
        console.error('Error loading completion status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletionStatus();
  }, [searchParams]);

  // Update URL when step changes
  useEffect(() => {
    setSearchParams({ step: currentStep.toString() });
  }, [currentStep, setSearchParams]);

  const steps: WizardStep[] = [
    {
      id: 'basic_info',
      title: 'Basic Information',
      description: 'Tell us about yourself',
      icon: User,
      component: BasicInfoStep
    },
    {
      id: 'teaching_skills',
      title: 'Teaching Skills',
      description: 'What can you teach?',
      icon: Book,
      component: TeachingSkillsStep
    },
    {
      id: 'learning_goals',
      title: 'Learning Goals',
      description: 'What do you want to learn?',
      icon: Target,
      component: LearningGoalsStep
    },
    {
      id: 'availability',
      title: 'Availability',
      description: 'When are you available?',
      icon: Calendar,
      component: AvailabilityStep
    }
  ];

  const handleNext = () => {
    // Debug: Log current form data
    console.log('🔍 Current step:', currentStep);
    console.log('🔍 Form data for validation:', {
      bio: formData.bio,
      bioLength: formData.bio?.length,
      bioTrimmed: formData.bio?.trim(),
      bioTrimmedLength: formData.bio?.trim().length,
      location: formData.location,
      locationLength: formData.location?.length,
      locationTrimmed: formData.location?.trim(),
      locationTrimmedLength: formData.location?.trim().length
    });

    // Validate current step before proceeding
    const validation = validateStepData(formData as OnboardingFormData, currentStep);
    console.log('🔍 Validation result:', validation);

    if (!validation.isValid) {
      console.error('❌ Step validation failed:', validation.errors);
      alert('Please complete the required fields:\n' + validation.errors.join('\n'));
      return;
    }

    console.log('✅ Step validation passed');
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      console.log('🚀 Starting comprehensive profile submission...');
      console.log('🔍 Complete form data for final validation:', formData);

      // Debug: Check each validation requirement individually
      console.log('🔍 Validation checks:');
      console.log('  Bio:', formData.bio, 'Length:', formData.bio?.length, 'Trimmed length:', formData.bio?.trim().length);
      console.log('  Location:', formData.location, 'Length:', formData.location?.length, 'Trimmed length:', formData.location?.trim().length);
      console.log('  Teaching skills count:', formData.teachingSkills.length);
      console.log('  Learning goals count:', formData.learningGoals.length);
      console.log('  Availability:', formData.availability);
      console.log('  Session preferences:', formData.sessionPreferences);

      // Validate form data
      const validation = validateFormData(formData as OnboardingFormData);
      console.log('🔍 Full validation result:', validation);

      if (!validation.isValid) {
        console.error('❌ Form validation failed with errors:', validation.errors);
        console.error('❌ Number of errors:', validation.errors.length);
        validation.errors.forEach((error, index) => {
          console.error(`❌ Error ${index + 1}:`, error);
        });

        alert('Please complete all required fields:\n\n' + validation.errors.map((error, index) => `${index + 1}. ${error}`).join('\n'));
        setIsLoading(false);
        return;
      }

      console.log('✅ Form validation passed');

      // Submit comprehensive profile data
      const result = await submitProfileData(formData as OnboardingFormData);
      console.log('✅ Profile creation completed successfully!', result);

      // Clear localStorage draft data
      try {
        localStorage.removeItem('skillswap_profile_draft');
        console.log('🗑️ Cleared profile draft from localStorage');
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }

      // Show success state
      setShowSuccessPopup(true);

      // Refresh profile completion status
      await refreshProfileStatus();

      // Wait for user to see success message, then navigate
      setTimeout(() => {
        console.log('🚀 Navigating to dashboard with completed profile...');
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    console.log('🔄 Updating form data:', field, '=', value);
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      console.log('🔄 Updated form data:', updated);

      // Save to localStorage for persistence
      try {
        localStorage.setItem('skillswap_profile_draft', JSON.stringify(updated));
        console.log('💾 Form data saved to localStorage');
      } catch (error) {
        console.warn('Failed to save form data to localStorage:', error);
      }

      return updated;
    });
  };

  // Debug functions for testing validation - accessible from browser console
  (window as any).testValidation = () => {
    console.log('🧪 Testing step validation with current form data:');
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);
    const validation = validateStepData(formData as OnboardingFormData, currentStep);
    console.log('Step validation result:', validation);
    return validation;
  };

  (window as any).testFullValidation = () => {
    console.log('🧪 Testing FULL validation with current form data:');
    console.log('Form data:', formData);

    // Test each validation requirement individually
    console.log('🔍 Individual checks:');
    console.log('  Bio valid:', formData.bio && formData.bio.trim().length >= 10);
    console.log('  Location valid:', formData.location && formData.location.trim().length >= 2);
    console.log('  Teaching skills valid:', formData.teachingSkills.length > 0);
    console.log('  Learning goals valid:', formData.learningGoals.length > 0);

    const hasAvailableTime = formData.availability.mornings || formData.availability.afternoons || formData.availability.evenings;
    const hasAvailableDays = formData.availability.weekdays || formData.availability.weekends;
    console.log('  Availability time valid:', hasAvailableTime);
    console.log('  Availability days valid:', hasAvailableDays);
    console.log('  Session preferences valid:', formData.sessionPreferences.virtualExchanges || formData.sessionPreferences.inPersonExchanges);

    const validation = validateFormData(formData as OnboardingFormData);
    console.log('Full validation result:', validation);
    return validation;
  };

  (window as any).checkFormData = () => {
    console.log('📋 Current form data state:');
    console.log('Current step:', currentStep);
    console.log('Form data:', formData);

    // Check localStorage
    try {
      const savedData = localStorage.getItem('skillswap_profile_draft');
      if (savedData) {
        console.log('💾 Saved data in localStorage:', JSON.parse(savedData));
      } else {
        console.log('💾 No saved data in localStorage');
      }
    } catch (error) {
      console.log('💾 Error reading localStorage:', error);
    }

    return formData;
  };

  (window as any).restoreFormData = () => {
    try {
      const savedData = localStorage.getItem('skillswap_profile_draft');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
        console.log('✅ Form data restored from localStorage');
        return parsedData;
      } else {
        console.log('❌ No saved data to restore');
        return null;
      }
    } catch (error) {
      console.error('❌ Error restoring form data:', error);
      return null;
    }
  };

  (window as any).testProfileSubmission = async () => {
    console.log('🧪 Testing profile submission step by step...');

    try {
      // Import the submission function
      const { submitProfileData } = await import('../services/onboarding.service');

      console.log('📋 Current form data:', formData);

      // Test the submission
      const result = await submitProfileData(formData as any);
      console.log('✅ Profile submission test successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Profile submission test failed:', error);
      return error;
    }
  };

  (window as any).validateAvatarData = () => {
    console.log('🖼️ Validating avatar data...');
    console.log('Avatar value:', formData.avatar);
    console.log('Avatar type:', typeof formData.avatar);
    console.log('Is File object:', formData.avatar instanceof File);

    if (formData.avatar instanceof File) {
      console.log('✅ Valid avatar file detected:');
      console.log('  Name:', formData.avatar.name);
      console.log('  Size:', formData.avatar.size, 'bytes');
      console.log('  Type:', formData.avatar.type);
      console.log('  Last modified:', new Date(formData.avatar.lastModified));
    } else if (formData.avatar) {
      console.log('⚠️ Avatar data exists but is not a File object');
      console.log('  This will be cleaned from the request to avoid 400 errors');
    } else {
      console.log('ℹ️ No avatar data - profile will be created without avatar');
    }

    return {
      hasAvatar: !!formData.avatar,
      isValidFile: formData.avatar instanceof File,
      avatarInfo: formData.avatar instanceof File ? {
        name: formData.avatar.name,
        size: formData.avatar.size,
        type: formData.avatar.type
      } : null
    };
  };

  (window as any).runComprehensiveValidation = () => {
    console.log('🔍 COMPREHENSIVE VALIDATION CHECK');
    console.log('='.repeat(50));

    // Check form data completeness
    console.log('📋 Form Data Completeness:');
    console.log('  Bio:', formData.bio ? `✅ ${formData.bio.length} chars` : '❌ Missing');
    console.log('  Location:', formData.location ? `✅ ${formData.location.length} chars` : '❌ Missing');
    console.log('  Teaching skills:', formData.teachingSkills.length > 0 ? `✅ ${formData.teachingSkills.length} skills` : '❌ None added');
    console.log('  Learning goals:', formData.learningGoals.length > 0 ? `✅ ${formData.learningGoals.length} goals` : '❌ None added');

    // Check avatar
    const avatarValidation = (window as any).validateAvatarData();
    console.log('  Avatar:', avatarValidation.isValidFile ? '✅ Valid file' : avatarValidation.hasAvatar ? '⚠️ Invalid data' : 'ℹ️ None');

    // Check availability
    const hasTime = formData.availability.mornings || formData.availability.afternoons || formData.availability.evenings;
    const hasDays = formData.availability.weekdays || formData.availability.weekends;
    console.log('  Availability:', hasTime && hasDays ? '✅ Set' : '❌ Incomplete');

    // Check session preferences
    const hasSessionPrefs = formData.sessionPreferences.virtualExchanges || formData.sessionPreferences.inPersonExchanges;
    console.log('  Session preferences:', hasSessionPrefs ? '✅ Set' : '❌ None selected');

    // Run validation
    const validation = (window as any).testFullValidation();

    console.log('\n🎯 VALIDATION SUMMARY:');
    console.log('Overall valid:', validation.isValid ? '✅ YES' : '❌ NO');
    if (!validation.isValid) {
      console.log('Errors to fix:');
      validation.errors.forEach((error: string, index: number) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    return {
      formComplete: validation.isValid,
      avatarValid: avatarValidation.isValidFile || !avatarValidation.hasAvatar,
      readyForSubmission: validation.isValid && (avatarValidation.isValidFile || !avatarValidation.hasAvatar)
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep - 1];
  const StepComponent = currentStepData.component;
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground mb-6">
            Let's set up your SkillSwap profile to help you find the perfect skill exchanges
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              const Icon = step.icon;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                  <span className="hidden sm:block font-medium">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <currentStepData.icon className="h-6 w-6" />
              <span>{currentStepData.title}</span>
            </CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <StepComponent 
              formData={formData}
              updateFormData={updateFormData}
              completionStatus={completionStatus}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              Skip for now
            </Button>
            
            {currentStep === steps.length ? (
              <Button
                onClick={handleComplete}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Complete Profile</span>
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Profile Created Successfully! 🎉
            </h3>
            <p className="text-gray-600 mb-4">
              Welcome to SkillSwap! Your profile is now complete and you can start connecting with other members.
            </p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              <span className="text-sm text-gray-500">Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Step Components
const BasicInfoStep = ({ formData, updateFormData }: any) => {
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData('avatar', file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
            <Upload className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground">Upload a profile picture</p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Bio <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="Tell us about yourself, your interests, background, and what makes you unique. This helps others understand who you are and what you bring to skill exchanges."
          value={formData.bio}
          onChange={(e) => {
            console.log('📝 Bio updated:', e.target.value, 'Length:', e.target.value.length);
            updateFormData('bio', e.target.value);
          }}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.bio.length}/500 characters
        </p>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Location <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="City, Country (e.g., New York, USA)"
            value={formData.location}
            onChange={(e) => {
              console.log('📍 Location updated:', e.target.value, 'Length:', e.target.value.length);
              updateFormData('location', e.target.value);
            }}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          This helps match you with nearby skill exchange partners
        </p>
      </div>

      {/* Contact Preferences */}
      <div>
        <label className="block text-sm font-medium mb-3">Contact Preferences</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showEmail"
              checked={formData.contactPreferences.showEmail}
              onChange={(e) => updateFormData('contactPreferences', {
                ...formData.contactPreferences,
                showEmail: e.target.checked
              })}
              className="rounded"
            />
            <label htmlFor="showEmail" className="text-sm">
              Show my email address on my profile
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="profileVisibility"
              checked={formData.contactPreferences.profileVisibility}
              onChange={(e) => updateFormData('contactPreferences', {
                ...formData.contactPreferences,
                profileVisibility: e.target.checked
              })}
              className="rounded"
            />
            <label htmlFor="profileVisibility" className="text-sm">
              Make my profile visible to other users
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeachingSkillsStep = ({ formData, updateFormData }: any) => {
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    yearsExperience: 1,
    description: '',
    teachingMethods: [] as string[],
    availableForTeaching: true
  });

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Highly skilled' },
    { value: 'expert', label: 'Expert', description: 'Professional level' }
  ];

  const teachingMethodOptions = [
    'One-on-one sessions',
    'Group workshops',
    'Online video calls',
    'In-person meetings',
    'Screen sharing',
    'Hands-on practice',
    'Project-based learning',
    'Mentoring'
  ];

  const addSkill = () => {
    if (newSkill.skillName.trim()) {
      const skill = {
        skillId: Date.now(), // Temporary ID
        skillName: newSkill.skillName,
        level: newSkill.level,
        yearsExperience: newSkill.yearsExperience,
        description: newSkill.description,
        teachingMethods: newSkill.teachingMethods,
        availableForTeaching: newSkill.availableForTeaching
      };

      updateFormData('teachingSkills', [...formData.teachingSkills, skill]);
      setNewSkill({
        skillName: '',
        level: 'intermediate',
        yearsExperience: 1,
        description: '',
        teachingMethods: [],
        availableForTeaching: true
      });
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = formData.teachingSkills.filter((_: any, i: number) => i !== index);
    updateFormData('teachingSkills', updatedSkills);
  };

  const toggleTeachingMethod = (method: string) => {
    const methods = newSkill.teachingMethods.includes(method)
      ? newSkill.teachingMethods.filter(m => m !== method)
      : [...newSkill.teachingMethods, method];
    setNewSkill({ ...newSkill, teachingMethods: methods });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Skills You Can Teach</h3>
        <p className="text-muted-foreground mb-4">
          Share your expertise! Add skills you're confident teaching others. This helps match you with learners.
        </p>
      </div>

      {/* Existing Skills */}
      {formData.teachingSkills.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Your Teaching Skills</h4>
          {formData.teachingSkills.map((skill: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 bg-muted/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-medium">{skill.skillName}</h5>
                  <Badge variant="secondary" className="mt-1">
                    {skill.level} • {skill.yearsExperience} years
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {skill.description && (
                <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>
              )}
              {skill.teachingMethods.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {skill.teachingMethods.map((method: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Skill */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Teaching Skill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Skill Name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., JavaScript, Guitar, Photography, Cooking"
              value={newSkill.skillName}
              onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
            />
          </div>

          {/* Level and Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Level</label>
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                className="w-full p-2 border rounded-md"
              >
                {skillLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <Input
                type="number"
                min="0"
                max="50"
                value={newSkill.yearsExperience}
                onChange={(e) => setNewSkill({ ...newSkill, yearsExperience: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <Textarea
              placeholder="Describe your experience, teaching style, or what makes you good at this skill..."
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Teaching Methods */}
          <div>
            <label className="block text-sm font-medium mb-2">Preferred Teaching Methods</label>
            <div className="grid grid-cols-2 gap-2">
              {teachingMethodOptions.map(method => (
                <div key={method} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={method}
                    checked={newSkill.teachingMethods.includes(method)}
                    onChange={() => toggleTeachingMethod(method)}
                    className="rounded"
                  />
                  <label htmlFor={method} className="text-sm">{method}</label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={addSkill} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Teaching Skill
          </Button>
        </CardContent>
      </Card>

      {formData.teachingSkills.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No teaching skills added yet.</p>
          <p className="text-sm">Add at least one skill you can teach to continue.</p>
        </div>
      )}
    </div>
  );
};

// LearningGoalsStep is now imported from separate component

// AvailabilityStep is now imported from separate component

export default ProfileCreateWizard;
