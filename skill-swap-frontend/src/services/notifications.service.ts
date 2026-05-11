/**
 * Notifications Service
 * 
 * This service handles notifications including fetching, marking as read,
 * and real-time updates.
 */

import { get, post } from './api.service';
import { NOTIFICATION_ENDPOINTS } from '@/config/api.config';
import { toast } from '@/components/ui/sonner';

// Types
export interface NotificationUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface Notification {
  id: number;
  recipient: number;
  sender?: number;
  sender_details?: NotificationUser;
  notification_type: 'message' | 'skill_swap_request' | 'session_request' | 'session_confirmed' | 'session_completed' | 'review' | 'system';
  title: string;
  content: string;
  is_read: boolean;
  action_url?: string;
  conversation?: number;
  message?: number;
  created_at: string;
  read_at?: string;
}

export interface UnreadCounts {
  unread_messages: number;
  unread_notifications: number;
}

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (): Promise<Notification[]> => {
  try {
    console.log('📥 Fetching notifications...');
    const response = await get<Notification[]>(NOTIFICATION_ENDPOINTS.GET_NOTIFICATIONS);
    console.log('✅ Notifications fetched:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    console.log(`📖 Marking notification ${notificationId} as read...`);
    await post(NOTIFICATION_ENDPOINTS.MARK_AS_READ(notificationId.toString()), {});
    console.log('✅ Notification marked as read');
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    console.log('📖 Marking all notifications as read...');
    await post(NOTIFICATION_ENDPOINTS.MARK_ALL_AS_READ, {});
    console.log('✅ All notifications marked as read');
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Get unread counts for messages and notifications
 */
export const getUnreadCounts = async (): Promise<UnreadCounts> => {
  try {
    console.log('📊 Fetching unread counts...');
    const response = await get<UnreadCounts>(NOTIFICATION_ENDPOINTS.GET_UNREAD_COUNTS);
    console.log('✅ Unread counts fetched:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching unread counts:', error);
    throw error;
  }
};

/**
 * Show toast notification
 */
export const showToastNotification = (notification: Notification): void => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'skill_swap_request':
        return '🔄';
      case 'session_request':
        return '📅';
      case 'session_confirmed':
        return '✅';
      case 'session_completed':
        return '🎉';
      case 'review':
        return '⭐';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const icon = getNotificationIcon(notification.notification_type);
  
  toast(`${icon} ${notification.title}`, {
    description: notification.content,
    duration: 5000,
    action: notification.action_url ? {
      label: 'View',
      onClick: () => {
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
      }
    } : undefined
  });
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

/**
 * Show browser push notification
 */
export const showBrowserNotification = (notification: Notification): void => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const browserNotification = new Notification(notification.title, {
    body: notification.content,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `notification-${notification.id}`,
    requireInteraction: false,
    silent: false
  });

  // Auto close after 5 seconds
  setTimeout(() => {
    browserNotification.close();
  }, 5000);

  // Handle click
  browserNotification.onclick = () => {
    window.focus();
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    browserNotification.close();
  };
};

/**
 * Play notification sound
 */
export const playNotificationSound = (): void => {
  try {
    // Create audio element for notification sound
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.3; // Set volume to 30%
    audio.play().catch(error => {
      console.log('Could not play notification sound:', error);
    });
  } catch (error) {
    console.log('Notification sound not available:', error);
  }
};

/**
 * Handle real-time notification
 */
export const handleRealTimeNotification = (notification: Notification): void => {
  console.log('🔔 Received real-time notification:', notification);

  // Show toast notification
  showToastNotification(notification);

  // Show browser notification if permission granted and page not visible
  if (document.hidden) {
    showBrowserNotification(notification);
  }

  // Play sound for important notifications
  if (['message', 'skill_swap_request', 'session_request'].includes(notification.notification_type)) {
    playNotificationSound();
  }
};

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enableToasts: boolean;
  enableBrowserNotifications: boolean;
  enableSounds: boolean;
  enableForMessages: boolean;
  enableForSkillSwapRequests: boolean;
  enableForSessionRequests: boolean;
  enableForReviews: boolean;
  enableForSystem: boolean;
}

/**
 * Get notification preferences from localStorage
 */
export const getNotificationPreferences = (): NotificationPreferences => {
  const defaultPreferences: NotificationPreferences = {
    enableToasts: true,
    enableBrowserNotifications: true,
    enableSounds: true,
    enableForMessages: true,
    enableForSkillSwapRequests: true,
    enableForSessionRequests: true,
    enableForReviews: true,
    enableForSystem: true
  };

  try {
    const stored = localStorage.getItem('notificationPreferences');
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading notification preferences:', error);
  }

  return defaultPreferences;
};

/**
 * Save notification preferences to localStorage
 */
export const saveNotificationPreferences = (preferences: NotificationPreferences): void => {
  try {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    console.log('✅ Notification preferences saved');
  } catch (error) {
    console.error('❌ Error saving notification preferences:', error);
  }
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCounts,
  showToastNotification,
  requestNotificationPermission,
  showBrowserNotification,
  playNotificationSound,
  handleRealTimeNotification,
  getNotificationPreferences,
  saveNotificationPreferences
};
