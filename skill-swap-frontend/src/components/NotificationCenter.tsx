import React, { useState, useEffect } from 'react';
import { Bell, Check, X, MessageCircle, Calendar, Star, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCounts,
  handleRealTimeNotification,
  type Notification,
  type UnreadCounts
} from '@/services/notifications.service';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { notifications: wsNotifications } = useWebSocket();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({ unread_messages: 0, unread_notifications: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Load notifications on mount
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCounts();
    }
  }, [isOpen]);

  // Handle real-time notifications
  useEffect(() => {
    wsNotifications.forEach(wsNotification => {
      if (wsNotification.type === 'notification' && wsNotification.notification) {
        handleNewRealTimeNotification(wsNotification.notification);
      }
    });
  }, [wsNotifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      // Ensure data is always an array
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Set empty array on error to prevent filter issues
      setNotifications([]);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async () => {
    try {
      const counts = await getUnreadCounts();
      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading unread counts:', error);
    }
  };

  const handleNewRealTimeNotification = (notification: Notification) => {
    // Add to notifications list - ensure prev is always an array
    setNotifications(prev => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return [notification, ...prevArray];
    });

    // Update unread count
    setUnreadCounts(prev => ({
      ...prev,
      unread_notifications: prev.unread_notifications + 1
    }));

    // Handle real-time notification display
    handleRealTimeNotification(notification);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state - ensure prev is always an array
      setNotifications(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        );
      });
      
      // Update unread count
      setUnreadCounts(prev => ({
        ...prev,
        unread_notifications: Math.max(0, prev.unread_notifications - 1)
      }));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state - ensure prev is always an array
      setNotifications(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }));
      });
      
      // Reset unread count
      setUnreadCounts(prev => ({ ...prev, unread_notifications: 0 }));
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'skill_swap_request':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'session_request':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'session_confirmed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFilteredNotifications = () => {
    // Ensure notifications is always an array
    const notificationsArray = Array.isArray(notifications) ? notifications : [];

    switch (activeTab) {
      case 'unread':
        return notificationsArray.filter(n => !n.is_read);
      case 'messages':
        return notificationsArray.filter(n => n.notification_type === 'message');
      case 'requests':
        return notificationsArray.filter(n =>
          ['skill_swap_request', 'session_request'].includes(n.notification_type)
        );
      default:
        return notificationsArray;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div 
        className="absolute right-4 top-16 w-96 max-h-[80vh] bg-background border rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCounts.unread_notifications > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCounts.unread_notifications}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCounts.unread_notifications === 0}
                >
                  Mark all read
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                  {unreadCounts.unread_notifications > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {unreadCounts.unread_notifications}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer border-l-4 ${
                        notification.is_read 
                          ? 'border-l-transparent' 
                          : 'border-l-primary bg-muted/20'
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          handleMarkAsRead(notification.id);
                        }
                        if (notification.action_url) {
                          window.location.href = notification.action_url;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.content}
                              </p>
                              
                              {notification.sender_details && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={notification.sender_details.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {notification.sender_details.first_name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    {notification.sender_details.first_name} {notification.sender_details.last_name}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </span>
                              {!notification.is_read && (
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationCenter;
