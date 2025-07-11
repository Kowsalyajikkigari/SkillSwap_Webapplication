/**
 * Onboarding Service
 * 
 * Handles comprehensive profile creation and data submission for the onboarding wizard
 */

import { apiService } from './api.service';

export interface OnboardingFormData {
  // Basic Info
  bio: string;
  location: string;
  avatar: File | null;
  contactPreferences: {
    showEmail: boolean;
    showPhone: boolean;
    profileVisibility: boolean;
  };
  
  // Teaching Skills
  teachingSkills: Array<{
    skillId: number;
    skillName: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsExperience: number;
    description: string;
    teachingMethods: string[];
    availableForTeaching: boolean;
  }>;
  
  // Learning Goals
  learningGoals: Array<{
    skillId: number;
    skillName: string;
    currentLevel: 'beginner' | 'intermediate' | 'advanced';
    goal: string;
    timeline: string;
    learningPreferences: string[];
  }>;
  
  // Complete Profile
  availability: {
    description: string;
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
  sessionPreferences: {
    virtualExchanges: boolean;
    inPersonExchanges: boolean;
    preferredDuration: string;
    maxStudentsPerSession: number;
  };
  communicationStyle: {
    responseTime: string;
    communicationMethod: string;
    languagePreferences: string[];
  };
}

/**
 * Submit comprehensive profile data to backend
 */
export const submitProfileData = async (formData: OnboardingFormData): Promise<any> => {
  console.log('🚀 Starting comprehensive profile submission...');
  console.log('📋 Original form data:', formData);

  // Remove duplicate skills before processing
  const cleanedFormData = removeDuplicateSkills(formData);
  console.log('📋 Cleaned form data (duplicates removed):', cleanedFormData);

  // Declare variables at function scope to avoid reference errors
  let profileModelResponse: any = null;
  let userProfileResponse: any = null;
  let preferencesResponse: any = null;
  let teachingSkillResults: any[] = [];
  let learningGoalResults: any[] = [];
  let additionalData: any = {};

  try {
    // Step 1: Update basic profile information
    console.log('📝 Step 1: Updating basic profile information...');

    // Update Profile model fields (bio, location) via /auth/profile/
    const profileModelData = {
      bio: cleanedFormData.bio,
      location: cleanedFormData.location,
    };

    console.log('📋 Profile model data (bio, location):', profileModelData);

    try {
      profileModelResponse = await apiService.updateProfilePreferences(profileModelData);
      console.log('✅ Profile model updated (bio, location):', profileModelResponse);
    } catch (profileError: any) {
      console.error('❌ STEP 1A FAILED - Profile model update error:', profileError);
      if (profileError.response) {
        console.error('❌ Profile model error details:', JSON.stringify(profileError.response.data, null, 2));
      }
      throw new Error(`Profile model update failed: ${profileError.message}`);
    }

    // Update User model fields (avatar, first_name, last_name) via /auth/user/profile/
    if (cleanedFormData.avatar) {
      const userProfileData: any = {};

      if (cleanedFormData.avatar instanceof File) {
        userProfileData.avatar = cleanedFormData.avatar;
        console.log('📸 Avatar file detected:', cleanedFormData.avatar.name, 'Size:', cleanedFormData.avatar.size);
      } else {
        console.log('⚠️ Avatar data is not a File object:', typeof cleanedFormData.avatar, cleanedFormData.avatar);
        userProfileData.avatar = cleanedFormData.avatar;
      }

      console.log('📋 User profile data (avatar):', {
        avatar: userProfileData.avatar instanceof File
          ? `File: ${userProfileData.avatar.name}`
          : userProfileData.avatar
            ? `Non-file avatar: ${typeof userProfileData.avatar}`
            : 'No avatar'
      });

      try {
        userProfileResponse = await apiService.updateProfile(userProfileData);
        console.log('✅ User profile updated (avatar):', userProfileResponse);
      } catch (userProfileError: any) {
        console.error('❌ STEP 1B FAILED - User profile update error:', userProfileError);
        if (userProfileError.response) {
          console.error('❌ User profile error details:', JSON.stringify(userProfileError.response.data, null, 2));
        }
        throw new Error(`User profile update failed: ${userProfileError.message}`);
      }
    }

    // Step 2: Update profile preferences
    console.log('📝 Step 2: Updating profile preferences...');
    const preferencesData = {
      show_email: cleanedFormData.contactPreferences.showEmail,
      show_phone: cleanedFormData.contactPreferences.showPhone || false,
      profile_visibility: cleanedFormData.contactPreferences.profileVisibility,
      available_weekdays: cleanedFormData.availability.weekdays,
      available_weekends: cleanedFormData.availability.weekends,
      available_mornings: cleanedFormData.availability.mornings,
      available_afternoons: cleanedFormData.availability.afternoons,
      available_evenings: cleanedFormData.availability.evenings,
      virtual_exchanges: cleanedFormData.sessionPreferences.virtualExchanges,
      in_person_exchanges: cleanedFormData.sessionPreferences.inPersonExchanges,
      availability: cleanedFormData.availability.description || '',
    };

    console.log('📋 Preferences data being sent:', preferencesData);

    try {
      preferencesResponse = await apiService.updateProfilePreferences(preferencesData);
      console.log('✅ Profile preferences updated:', preferencesResponse);
    } catch (preferencesError: any) {
      console.error('❌ STEP 2 FAILED - Preferences update error:', preferencesError);
      if (preferencesError.response) {
        console.error('❌ Preferences error details:', JSON.stringify(preferencesError.response.data, null, 2));
      }
      throw new Error(`Preferences update failed: ${preferencesError.message}`);
    }

    // Step 3: Create teaching skills
    console.log('📝 Step 3: Creating teaching skills...');
    const teachingSkillPromises = cleanedFormData.teachingSkills.map(async (skill) => {
      try {
        // First, search for existing skill
        console.log(`🔍 Searching for skill: ${skill.skillName}`);
        const existingSkills = await apiService.searchSkills(skill.skillName);

        if (existingSkills.length > 0) {
          // Use existing skill
          skill.skillId = existingSkills[0].id;
          console.log(`✅ Found existing skill: ${skill.skillName} (ID: ${skill.skillId})`);
        } else {
          // Create new skill if it doesn't exist
          console.log(`🆕 Creating new skill: ${skill.skillName}`);
          const skillData = {
            name: skill.skillName,
            category: 1, // Default to first category for now
            description: skill.description || `${skill.skillName} skill`
          };

          const createdSkill = await apiService.createSkill(skillData);
          skill.skillId = createdSkill.id;
          console.log(`✅ Created new skill: ${skill.skillName} (ID: ${skill.skillId})`);
        }

        // Create user teaching skill
        const userSkillData = {
          skill: skill.skillId,
          level: skill.level,
          description: skill.description || '',
          years_experience: skill.yearsExperience || 0
        };

        console.log('📋 Creating user teaching skill with data:', userSkillData);

        const result = await apiService.createUserTeachingSkill(userSkillData);
        console.log(`✅ Created user teaching skill: ${skill.skillName}`);
        return result;
      } catch (error: any) {
        console.error(`❌ Error processing teaching skill ${skill.skillName}:`, error);
        if (error.response) {
          console.error(`❌ Teaching skill error details:`, JSON.stringify(error.response.data, null, 2));
        }
        throw new Error(`Teaching skill creation failed for ${skill.skillName}: ${error.message}`);
      }
    });

    teachingSkillResults = await Promise.allSettled(teachingSkillPromises);
    console.log('✅ Teaching skills results:', teachingSkillResults);

    // Check for any failed teaching skills
    const failedTeachingSkills = teachingSkillResults.filter(result => result.status === 'rejected');
    if (failedTeachingSkills.length > 0) {
      console.error('❌ Some teaching skills failed to create:', failedTeachingSkills);
      
      // Extract error messages for better debugging
      const errorMessages = failedTeachingSkills.map((result: any) => {
        if (result.reason?.message?.includes('UNIQUE constraint failed')) {
          return 'Duplicate skill detected (this is normal and will be handled)';
        }
        return result.reason?.message || 'Unknown error';
      });
      
      console.log('📋 Error details:', errorMessages);
      
      // Don't throw error for duplicate constraints as backend should handle them
      const nonDuplicateErrors = failedTeachingSkills.filter((result: any) => 
        !result.reason?.message?.includes('UNIQUE constraint failed')
      );
      
      if (nonDuplicateErrors.length > 0) {
        throw new Error(`Failed to create ${nonDuplicateErrors.length} teaching skill(s)`);
      } else {
        console.log('✅ All teaching skill errors were duplicate constraints (handled by backend)');
      }
    }

    // Step 4: Create learning goals
    console.log('📝 Step 4: Creating learning goals...');
    const learningGoalPromises = cleanedFormData.learningGoals.map(async (goal) => {
      try {
        // First, search for existing skill
        console.log(`🔍 Searching for learning skill: ${goal.skillName}`);
        const existingSkills = await apiService.searchSkills(goal.skillName);

        if (existingSkills.length > 0) {
          // Use existing skill
          goal.skillId = existingSkills[0].id;
          console.log(`✅ Found existing skill: ${goal.skillName} (ID: ${goal.skillId})`);
        } else {
          // Create new skill if it doesn't exist
          console.log(`🆕 Creating new learning skill: ${goal.skillName}`);
          const skillData = {
            name: goal.skillName,
            category: 1, // Default to first category for now
            description: goal.goal || `${goal.skillName} skill`
          };

          const createdSkill = await apiService.createSkill(skillData);
          goal.skillId = createdSkill.id;
          console.log(`✅ Created new skill: ${goal.skillName} (ID: ${goal.skillId})`);
        }

        // Create user learning skill
        const userLearningSkillData = {
          skill: goal.skillId,
          current_level: goal.currentLevel,
          goal: goal.goal || ''
        };

        console.log('📋 Creating user learning skill with data:', userLearningSkillData);

        const result = await apiService.createUserLearningSkill(userLearningSkillData);
        console.log(`✅ Created user learning goal: ${goal.skillName}`);
        return result;
      } catch (error: any) {
        console.error(`❌ Error processing learning goal ${goal.skillName}:`, error);
        if (error.response) {
          console.error(`❌ Learning skill error details:`, JSON.stringify(error.response.data, null, 2));
        }
        throw new Error(`Learning skill creation failed for ${goal.skillName}: ${error.message}`);
      }
    });

    learningGoalResults = await Promise.allSettled(learningGoalPromises);
    console.log('✅ Learning goals results:', learningGoalResults);

    // Check for any failed learning goals
    const failedLearningGoals = learningGoalResults.filter(result => result.status === 'rejected');
    if (failedLearningGoals.length > 0) {
      console.error('❌ Some learning goals failed to create:', failedLearningGoals);
      
      // Extract error messages for better debugging
      const errorMessages = failedLearningGoals.map((result: any) => {
        if (result.reason?.message?.includes('UNIQUE constraint failed')) {
          return 'Duplicate learning goal detected (this is normal and will be handled)';
        }
        return result.reason?.message || 'Unknown error';
      });
      
      console.log('📋 Learning goal error details:', errorMessages);
      
      // Don't throw error for duplicate constraints as backend should handle them
      const nonDuplicateErrors = failedLearningGoals.filter((result: any) => 
        !result.reason?.message?.includes('UNIQUE constraint failed')
      );
      
      if (nonDuplicateErrors.length > 0) {
        throw new Error(`Failed to create ${nonDuplicateErrors.length} learning goal(s)`);
      } else {
        console.log('✅ All learning goal errors were duplicate constraints (handled by backend)');
      }
    }

    // Step 5: Store additional preferences in localStorage for now
    console.log('📝 Step 5: Storing additional preferences...');
    additionalData = {
      sessionPreferences: cleanedFormData.sessionPreferences,
      communicationStyle: cleanedFormData.communicationStyle,
      teachingMethods: cleanedFormData.teachingSkills.reduce((acc, skill) => {
        acc[skill.skillName] = skill.teachingMethods || [];
        return acc;
      }, {} as Record<string, string[]>),
      learningPreferences: cleanedFormData.learningGoals.reduce((acc, goal) => {
        acc[goal.skillName] = goal.learningPreferences || [];
        return acc;
      }, {} as Record<string, string[]>),
      timelines: cleanedFormData.learningGoals.reduce((acc, goal) => {
        acc[goal.skillName] = goal.timeline || '';
        return acc;
      }, {} as Record<string, string>)
    };

    localStorage.setItem('skillswap_onboarding_preferences', JSON.stringify(additionalData));
    console.log('✅ Additional preferences stored');

    console.log('🎉 Comprehensive profile submission completed successfully!');
    
    return {
      success: true,
      profileModel: profileModelResponse,
      userProfile: userProfileResponse,
      preferences: preferencesResponse,
      teachingSkills: teachingSkillResults,
      learningGoals: learningGoalResults,
      additionalData
    };

  } catch (error: any) {
    console.error('❌ Error submitting profile data:', error);

    // Enhanced error logging for debugging
    if (error.response) {
      console.error('❌ Error response status:', error.response.status);
      console.error('❌ Error response statusText:', error.response.statusText);

      // Deep log the response data
      console.error('❌ Error response data (raw):', error.response.data);
      console.error('❌ Error response data (stringified):', JSON.stringify(error.response.data, null, 2));

      // Check if it's a validation error
      if (error.response.data) {
        console.error('❌ Detailed error breakdown:');
        Object.keys(error.response.data).forEach(key => {
          console.error(`  - ${key}:`, error.response.data[key]);
        });
      }

      console.error('❌ Error response headers:', error.response.headers);
      console.error('❌ Error config URL:', error.config?.url);
      console.error('❌ Error config method:', error.config?.method);
      console.error('❌ Error config data:', error.config?.data);
    } else if (error.request) {
      console.error('❌ Error request:', error.request);
    } else {
      console.error('❌ Error message:', error.message);
    }

    throw error;
  }
};

/**
 * Remove duplicate skills from form data
 */
export const removeDuplicateSkills = (formData: OnboardingFormData): OnboardingFormData => {
  console.log('🔍 Checking for duplicate skills...');
  
  // Remove duplicate teaching skills based on skillId or skillName
  const uniqueTeachingSkills = formData.teachingSkills.filter((skill, index, array) => {
    const firstIndex = array.findIndex(s => 
      (s.skillId && skill.skillId && s.skillId === skill.skillId) ||
      (s.skillName && skill.skillName && s.skillName.toLowerCase() === skill.skillName.toLowerCase())
    );
    return firstIndex === index;
  });

  // Remove duplicate learning goals based on skillId or skillName
  const uniqueLearningGoals = formData.learningGoals.filter((goal, index, array) => {
    const firstIndex = array.findIndex(g => 
      (g.skillId && goal.skillId && g.skillId === goal.skillId) ||
      (g.skillName && goal.skillName && g.skillName.toLowerCase() === goal.skillName.toLowerCase())
    );
    return firstIndex === index;
  });

  const duplicateTeachingCount = formData.teachingSkills.length - uniqueTeachingSkills.length;
  const duplicateLearningCount = formData.learningGoals.length - uniqueLearningGoals.length;

  if (duplicateTeachingCount > 0) {
    console.log(`🗑️ Removed ${duplicateTeachingCount} duplicate teaching skill(s)`);
  }
  if (duplicateLearningCount > 0) {
    console.log(`🗑️ Removed ${duplicateLearningCount} duplicate learning goal(s)`);
  }

  return {
    ...formData,
    teachingSkills: uniqueTeachingSkills,
    learningGoals: uniqueLearningGoals
  };
};

/**
 * Validate form data before submission
 */
export const validateFormData = (formData: OnboardingFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Basic info validation
  if (!formData.bio || formData.bio.trim().length < 10) {
    errors.push('Bio must be at least 10 characters long');
  }

  if (!formData.location || formData.location.trim().length < 2) {
    errors.push('Location is required');
  }

  // Teaching skills validation
  if (formData.teachingSkills.length === 0) {
    errors.push('At least one teaching skill is required');
  }

  // Learning goals validation
  if (formData.learningGoals.length === 0) {
    errors.push('At least one learning goal is required');
  }

  // Availability validation
  const hasAvailableTime = formData.availability.mornings ||
                          formData.availability.afternoons ||
                          formData.availability.evenings;

  const hasAvailableDays = formData.availability.weekdays ||
                          formData.availability.weekends;

  if (!hasAvailableTime || !hasAvailableDays) {
    errors.push('Please select at least one available time and day');
  }

  // Session preferences validation
  if (!formData.sessionPreferences.virtualExchanges && !formData.sessionPreferences.inPersonExchanges) {
    errors.push('Please select at least one session type (virtual or in-person)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate specific step data
 */
export const validateStepData = (formData: OnboardingFormData, step: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  switch (step) {
    case 1: // Basic Info
      if (!formData.bio || formData.bio.trim().length < 10) {
        errors.push('Bio must be at least 10 characters long');
      }
      if (!formData.location || formData.location.trim().length < 2) {
        errors.push('Location is required');
      }
      break;

    case 2: // Teaching Skills
      if (formData.teachingSkills.length === 0) {
        errors.push('At least one teaching skill is required');
      }
      break;

    case 3: // Learning Goals
      if (formData.learningGoals.length === 0) {
        errors.push('At least one learning goal is required');
      }
      break;

    case 4: // Availability
      const hasAvailableTime = formData.availability.mornings ||
                              formData.availability.afternoons ||
                              formData.availability.evenings;

      const hasAvailableDays = formData.availability.weekdays ||
                              formData.availability.weekends;

      if (!hasAvailableTime || !hasAvailableDays) {
        errors.push('Please select at least one available time and day');
      }

      if (!formData.sessionPreferences.virtualExchanges && !formData.sessionPreferences.inPersonExchanges) {
        errors.push('Please select at least one session type (virtual or in-person)');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate profile completion percentage
 */
export const calculateCompletionPercentage = (formData: OnboardingFormData): number => {
  let completedSections = 0;
  const totalSections = 4;

  // Basic info (25%)
  if (formData.bio && formData.location) {
    completedSections += 1;
  }

  // Teaching skills (25%)
  if (formData.teachingSkills.length > 0) {
    completedSections += 1;
  }

  // Learning goals (25%)
  if (formData.learningGoals.length > 0) {
    completedSections += 1;
  }

  // Availability and preferences (25%)
  const hasAvailability = formData.availability.mornings || 
                         formData.availability.afternoons || 
                         formData.availability.evenings;
  const hasSessionPrefs = formData.sessionPreferences.virtualExchanges || 
                         formData.sessionPreferences.inPersonExchanges;
  
  if (hasAvailability && hasSessionPrefs) {
    completedSections += 1;
  }

  return Math.round((completedSections / totalSections) * 100);
};
