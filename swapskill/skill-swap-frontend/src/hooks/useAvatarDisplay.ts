/**
 * Avatar Display Hook
 * 
 * This hook provides consistent avatar display logic across all components
 * and automatically updates when the avatar changes.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { avatarSyncService } from '../services/avatar-sync.service';
import { addCacheBusting } from '../services/profiles';

interface AvatarDisplayData {
  avatarUrl: string | null;
  fallbackAvatar: string;
  userInitials: string;
  isLoading: boolean;
}

/**
 * Hook for consistent avatar display across components
 */
export const useAvatarDisplay = (): AvatarDisplayData => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate user initials
  const userInitials = (() => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  })();

  // Generate fallback avatar URL
  const fallbackAvatar = (() => {
    if (!user) return 'https://i.pravatar.cc/150?img=1';
    return `https://i.pravatar.cc/150?u=${user.id || user.email}`;
  })();

  // Initialize avatar URL
  useEffect(() => {
    const initializeAvatar = () => {
      setIsLoading(true);
      
      if (user?.avatar) {
        const urlWithCacheBusting = addCacheBusting(user.avatar);
        setAvatarUrl(urlWithCacheBusting);
      } else {
        setAvatarUrl(null);
      }
      
      setIsLoading(false);
    };

    initializeAvatar();
  }, [user]);

  // Subscribe to avatar updates
  useEffect(() => {
    const unsubscribe = avatarSyncService.subscribe((newAvatarUrl) => {
      console.log('🔄 useAvatarDisplay - Avatar updated:', newAvatarUrl);
      setAvatarUrl(newAvatarUrl);
    });

    return unsubscribe;
  }, []);

  return {
    avatarUrl,
    fallbackAvatar,
    userInitials,
    isLoading
  };
};

/**
 * Hook for avatar upload functionality
 */
export const useAvatarUpload = () => {
  const { user, updateUser, refreshUserData } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!file) {
      setUploadError('No file provided');
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return null;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return null;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      
      console.log('📸 useAvatarUpload - Starting avatar upload...');
      
      const avatarUrl = await avatarSyncService.uploadAndSyncAvatar(
        file,
        updateUser,
        refreshUserData
      );
      
      console.log('✅ useAvatarUpload - Avatar uploaded successfully');
      return avatarUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      console.error('❌ useAvatarUpload - Upload failed:', errorMessage);
      setUploadError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearAvatar = async (): Promise<void> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      await avatarSyncService.clearAndSyncAvatar(updateUser, refreshUserData);
      
      console.log('✅ useAvatarUpload - Avatar cleared successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear avatar';
      console.error('❌ useAvatarUpload - Clear failed:', errorMessage);
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const refreshAvatar = async (): Promise<void> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      await avatarSyncService.refreshAndSyncAvatar(updateUser, refreshUserData);
      
      console.log('✅ useAvatarUpload - Avatar refreshed successfully');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh avatar';
      console.error('❌ useAvatarUpload - Refresh failed:', errorMessage);
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAvatar,
    clearAvatar,
    refreshAvatar,
    isUploading,
    uploadError,
    clearError: () => setUploadError(null)
  };
};

export default useAvatarDisplay;
