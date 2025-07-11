import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCounts, type UnreadCounts } from '@/services/notifications.service';
import NotificationCenter from './NotificationCenter';

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { isConnected, notifications: wsNotifications } = useWebSocket();
  
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({ 
    unread_messages: 0, 
    unread_notifications: 0 
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial unread counts
  useEffect(() => {
    if (user) {
      loadUnreadCounts();
      
      // Refresh counts every 30 seconds
      const interval = setInterval(loadUnreadCounts, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handle real-time updates
  useEffect(() => {
    wsNotifications.forEach(wsNotification => {
      if (wsNotification.type === 'notification') {
        // Increment notification count
        setUnreadCounts(prev => ({
          ...prev,
          unread_notifications: prev.unread_notifications + 1
        }));
      } else if (wsNotification.type === 'chat_message') {
        // Increment message count
        setUnreadCounts(prev => ({
          ...prev,
          unread_messages: prev.unread_messages + 1
        }));
      }
    });
  }, [wsNotifications]);

  const loadUnreadCounts = async () => {
    try {
      setLoading(true);
      const counts = await getUnreadCounts();
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading unread counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalUnread = unreadCounts.unread_messages + unreadCounts.unread_notifications;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
    // Refresh counts when closing
    loadUnreadCounts();
  };

  if (!user) return null;

  return (
    <>
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNotificationClick}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
        
        {/* Connection status indicator */}
        <div className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={handleNotificationClose}
      />
    </>
  );
};

export default NotificationBadge;
