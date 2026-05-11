/**
 * Dashboard Refresh Hook
 * 
 * This hook provides functions to refresh dashboard data from other components
 * and automatically triggers refreshes when profile data changes.
 */

import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUserProfile } from '../services/profiles';
import { avatarSyncService } from '../services/avatar-sync.service';

interface DashboardRefreshHook {
  refreshProfile: () => Promise<void>;
  triggerDashboardRefresh: () => void;
  isRefreshing: boolean;
}

/**
 * Hook for refreshing dashboard data from other components
 */
export const useDashboardRefresh = (): DashboardRefreshHook => {
  const { refreshUserData } = useAuth();

  // Refresh profile data and notify dashboard
  const refreshProfile = useCallback(async () => {
    try {
      console.log('🔄 useDashboardRefresh - Refreshing profile...');
      
      // Refresh user data in auth context
      await refreshUserData();
      
      // Trigger dashboard refresh if available
      if ((window as any).dashboardRefresh?.refreshProfile) {
        await (window as any).dashboardRefresh.refreshProfile();
      }
      
      console.log('✅ useDashboardRefresh - Profile refreshed');
    } catch (error) {
      console.error('❌ useDashboardRefresh - Error refreshing profile:', error);
    }
  }, [refreshUserData]);

  // Trigger full dashboard refresh
  const triggerDashboardRefresh = useCallback(() => {
    try {
      console.log('🔄 useDashboardRefresh - Triggering dashboard refresh...');
      
      if ((window as any).dashboardRefresh?.refreshAll) {
        (window as any).dashboardRefresh.refreshAll();
      } else {
        console.warn('⚠️ Dashboard refresh function not available');
      }
    } catch (error) {
      console.error('❌ useDashboardRefresh - Error triggering refresh:', error);
    }
  }, []);

  return {
    refreshProfile,
    triggerDashboardRefresh,
    isRefreshing: false // TODO: Add loading state if needed
  };
};

/**
 * Hook for profile update notifications
 * Use this in components that update profile data to notify the dashboard
 */
export const useProfileUpdateNotification = () => {
  const { refreshProfile, triggerDashboardRefresh } = useDashboardRefresh();

  // Notify dashboard of profile update
  const notifyProfileUpdate = useCallback(async () => {
    try {
      console.log('📢 Profile update notification - Refreshing dashboard...');
      await refreshProfile();
    } catch (error) {
      console.error('❌ Error notifying profile update:', error);
    }
  }, [refreshProfile]);

  // Notify dashboard of avatar update
  const notifyAvatarUpdate = useCallback(async (avatarUrl: string | null) => {
    try {
      console.log('📢 Avatar update notification - Refreshing dashboard...');
      
      // The avatar sync service will handle the notification
      // but we can also trigger a profile refresh for good measure
      await refreshProfile();
    } catch (error) {
      console.error('❌ Error notifying avatar update:', error);
    }
  }, [refreshProfile]);

  // Notify dashboard of skill update
  const notifySkillUpdate = useCallback(() => {
    try {
      console.log('📢 Skill update notification - Refreshing dashboard...');
      triggerDashboardRefresh();
    } catch (error) {
      console.error('❌ Error notifying skill update:', error);
    }
  }, [triggerDashboardRefresh]);

  return {
    notifyProfileUpdate,
    notifyAvatarUpdate,
    notifySkillUpdate
  };
};

/**
 * Hook for automatic dashboard refresh on data changes
 * Use this in components that need to stay in sync with dashboard
 */
export const useAutoDashboardSync = () => {
  const { refreshProfile } = useDashboardRefresh();

  // Subscribe to avatar updates
  const subscribeToAvatarUpdates = useCallback(() => {
    const unsubscribe = avatarSyncService.subscribe(async (newAvatarUrl) => {
      console.log('🔄 Auto sync - Avatar updated, refreshing dashboard...');
      await refreshProfile();
    });

    return unsubscribe;
  }, [refreshProfile]);

  return {
    subscribeToAvatarUpdates
  };
};

export default useDashboardRefresh;
