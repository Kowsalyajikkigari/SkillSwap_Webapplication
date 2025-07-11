/**
 * Avatar Synchronization Service
 * 
 * This service handles avatar upload and synchronization across all components
 * in the SkillSwap application to ensure consistent avatar display.
 */

import { getCurrentUserProfile, updateProfile, addCacheBusting } from './profiles';
import { useAuth } from '../contexts/AuthContext';

// Event system for avatar updates
type AvatarUpdateListener = (avatarUrl: string | null) => void;

class AvatarSyncService {
  private listeners: AvatarUpdateListener[] = [];
  private currentAvatarUrl: string | null = null;

  /**
   * Subscribe to avatar updates
   */
  subscribe(listener: AvatarUpdateListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of avatar update
   */
  private notifyListeners(avatarUrl: string | null): void {
    this.currentAvatarUrl = avatarUrl;
    this.listeners.forEach(listener => listener(avatarUrl));
  }

  /**
   * Upload avatar and sync across all components
   */
  async uploadAndSyncAvatar(
    file: File,
    updateUser: (userData: any) => void,
    refreshUserData: () => Promise<void>
  ): Promise<string | null> {
    try {
      console.log('📸 AvatarSync - Starting avatar upload and sync...');

      // Get current user profile to include required fields
      console.log('🔄 AvatarSync - Fetching current user profile for required fields...');
      const currentProfile = await getCurrentUserProfile();
      console.log('📊 AvatarSync - Current profile data:', currentProfile);

      // Upload avatar to backend with required fields
      const updateData = {
        avatar: file,
        first_name: currentProfile.first_name,
        last_name: currentProfile.last_name
      };
      console.log('📤 AvatarSync - Uploading with data:', {
        ...updateData,
        avatar: `File: ${file.name} (${file.size} bytes)`
      });

      const updatedProfile = await updateProfile(updateData);
      
      if (!updatedProfile.avatar) {
        throw new Error('Avatar upload failed - no avatar URL returned from backend');
      }

      console.log('✅ AvatarSync - Avatar uploaded successfully:', updatedProfile.avatar);
      
      // Add cache busting to ensure fresh image
      const avatarUrlWithCacheBusting = addCacheBusting(updatedProfile.avatar);
      
      // Update auth context
      updateUser({
        avatar: updatedProfile.avatar
      });
      
      // Refresh user data from backend
      await refreshUserData();
      
      // Notify all components of the avatar update
      this.notifyListeners(avatarUrlWithCacheBusting);
      
      console.log('✅ AvatarSync - Avatar synchronized across all components');
      return avatarUrlWithCacheBusting;
      
    } catch (error) {
      console.error('❌ AvatarSync - Error uploading and syncing avatar:', error);
      throw error;
    }
  }

  /**
   * Refresh avatar from backend and sync
   */
  async refreshAndSyncAvatar(
    updateUser: (userData: any) => void,
    refreshUserData: () => Promise<void>
  ): Promise<string | null> {
    try {
      console.log('🔄 AvatarSync - Refreshing avatar from backend...');
      
      // Get latest profile data
      const profileData = await getCurrentUserProfile();
      const avatarUrl = profileData.avatar ? addCacheBusting(profileData.avatar) : null;
      
      // Update auth context
      updateUser({
        avatar: profileData.avatar
      });
      
      // Refresh user data
      await refreshUserData();
      
      // Notify all components
      this.notifyListeners(avatarUrl);
      
      console.log('✅ AvatarSync - Avatar refreshed and synchronized');
      return avatarUrl;
      
    } catch (error) {
      console.error('❌ AvatarSync - Error refreshing avatar:', error);
      throw error;
    }
  }

  /**
   * Get current avatar URL with cache busting
   */
  getCurrentAvatarUrl(): string | null {
    return this.currentAvatarUrl;
  }

  /**
   * Initialize avatar sync with current user data
   */
  async initializeAvatar(
    authUser: any,
    updateUser: (userData: any) => void,
    refreshUserData: () => Promise<void>
  ): Promise<void> {
    try {
      if (!authUser) return;
      
      console.log('🚀 AvatarSync - Initializing avatar sync...');
      
      // Get fresh profile data from backend
      const profileData = await getCurrentUserProfile();
      const avatarUrl = profileData.avatar ? addCacheBusting(profileData.avatar) : null;
      
      // Update current avatar URL
      this.currentAvatarUrl = avatarUrl;
      
      // If backend avatar differs from auth context, update it
      if (profileData.avatar !== authUser.avatar) {
        updateUser({
          avatar: profileData.avatar
        });
        await refreshUserData();
      }
      
      console.log('✅ AvatarSync - Avatar sync initialized');
      
    } catch (error) {
      console.error('❌ AvatarSync - Error initializing avatar sync:', error);
    }
  }

  /**
   * Clear avatar and sync removal across components
   */
  async clearAndSyncAvatar(
    updateUser: (userData: any) => void,
    refreshUserData: () => Promise<void>
  ): Promise<void> {
    try {
      console.log('🗑️ AvatarSync - Clearing avatar...');

      // Get current user profile to include required fields
      console.log('🔄 AvatarSync - Fetching current user profile for required fields...');
      const currentProfile = await getCurrentUserProfile();

      // Update backend to remove avatar with required fields
      const updateData = {
        avatar: null,
        first_name: currentProfile.first_name,
        last_name: currentProfile.last_name
      };
      console.log('📤 AvatarSync - Clearing avatar with data:', updateData);

      await updateProfile(updateData);
      
      // Update auth context
      updateUser({
        avatar: null
      });
      
      // Refresh user data
      await refreshUserData();
      
      // Notify all components
      this.notifyListeners(null);
      
      console.log('✅ AvatarSync - Avatar cleared and synchronized');
      
    } catch (error) {
      console.error('❌ AvatarSync - Error clearing avatar:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const avatarSyncService = new AvatarSyncService();

/**
 * React hook for avatar synchronization
 */
export const useAvatarSync = () => {
  const { user, updateUser, refreshUserData } = useAuth();
  
  return {
    uploadAndSyncAvatar: (file: File) => 
      avatarSyncService.uploadAndSyncAvatar(file, updateUser, refreshUserData),
    
    refreshAndSyncAvatar: () => 
      avatarSyncService.refreshAndSyncAvatar(updateUser, refreshUserData),
    
    clearAndSyncAvatar: () => 
      avatarSyncService.clearAndSyncAvatar(updateUser, refreshUserData),
    
    initializeAvatar: () => 
      avatarSyncService.initializeAvatar(user, updateUser, refreshUserData),
    
    getCurrentAvatarUrl: () => 
      avatarSyncService.getCurrentAvatarUrl(),
    
    subscribe: (listener: AvatarUpdateListener) => 
      avatarSyncService.subscribe(listener)
  };
};

export default avatarSyncService;
