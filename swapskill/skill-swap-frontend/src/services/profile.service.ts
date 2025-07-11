/**
 * Profile Service
 * 
 * This service handles profile-related data storage and retrieval
 * for the SkillSwap application.
 */

export interface ProfileData {
  avatar?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  location?: string;
  bio?: string;
  selectedSkills?: string[];
  learningSkills?: string[];
  preferences?: {
    virtual?: boolean;
    inPerson?: boolean;
    weekdays?: boolean;
    weekends?: boolean;
    mornings?: boolean;
    afternoons?: boolean;
    evenings?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showPhone?: boolean;
    profileVisibility?: boolean;
  };
}

const PROFILE_STORAGE_KEY = 'skillswap_profile_data';

/**
 * Save profile data to localStorage
 * @param profileData - Profile data to save
 */
export const saveProfileData = (profileData: Partial<ProfileData>): void => {
  try {
    const existingData = getProfileData();
    const updatedData = { ...existingData, ...profileData };
    console.log('🔄 Saving profile data:', updatedData);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedData));
    console.log('✅ Profile data saved successfully');

    // Verify the save worked
    const savedData = localStorage.getItem(PROFILE_STORAGE_KEY);
    console.log('🔍 Verification - Data in localStorage:', savedData);
  } catch (error) {
    console.error('❌ Error saving profile data:', error);
  }
};

/**
 * Get profile data from localStorage
 * @returns Profile data or empty object
 */
export const getProfileData = (): ProfileData => {
  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting profile data:', error);
    return {};
  }
};

/**
 * Clear profile data from localStorage
 */
export const clearProfileData = (): void => {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing profile data:', error);
  }
};

/**
 * Update specific profile field
 * @param field - Field name to update
 * @param value - New value for the field
 */
export const updateProfileField = (field: keyof ProfileData, value: any): void => {
  const currentData = getProfileData();
  saveProfileData({ ...currentData, [field]: value });
};

/**
 * Get user's profile picture
 * @returns Profile picture URL or null
 */
export const getProfilePicture = (): string | null => {
  const profileData = getProfileData();
  return profileData.avatar || null;
};

/**
 * Save profile picture
 * @param avatarUrl - Profile picture URL or base64 data
 */
export const saveProfilePicture = (avatarUrl: string): void => {
  updateProfileField('avatar', avatarUrl);
};

export default {
  saveProfileData,
  getProfileData,
  clearProfileData,
  updateProfileField,
  getProfilePicture,
  saveProfilePicture,
};
