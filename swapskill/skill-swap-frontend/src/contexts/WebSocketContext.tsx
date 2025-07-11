import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import websocketService, { WebSocketMessage } from '../services/websocket.service';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';

// Define the shape of the context
interface WebSocketContextType {
  isConnected: boolean;
  messagesConnected: boolean;
  notificationsConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  messages: WebSocketMessage[];
  notifications: WebSocketMessage[];
  clearMessages: () => void;
  clearNotifications: () => void;
  reconnect: () => void;
}

// Create the context with a default value
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  messagesConnected: false,
  notificationsConnected: false,
  sendMessage: () => {},
  messages: [],
  notifications: [],
  clearMessages: () => {},
  clearNotifications: () => {},
  reconnect: () => {},
});

// Custom hook to use the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

// Provider component
interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messagesConnected, setMessagesConnected] = useState(false);
  const [notificationsConnected, setNotificationsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const { isAuthenticated } = useAuth();

  // Initialize WebSocket connection when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      websocketService.init();

      // Set up connection status callback
      websocketService.setConnectionStatusCallback((messagesConnected, notificationsConnected) => {
        setMessagesConnected(messagesConnected);
        setNotificationsConnected(notificationsConnected);
      });

      // Add message handler
      const messageHandler = (message: WebSocketMessage) => {
        if (message.type === 'pong') return; // Ignore pong responses

        setMessages(prev => [...prev, message]);
      };

      // Add notification handler
      const notificationHandler = (notification: WebSocketMessage) => {
        if (notification.type === 'pong') return; // Ignore pong responses

        setNotifications(prev => [...prev, notification]);

        // Show toast notification
        toast(notification.type, {
          description: notification.payload?.message || 'You have a new notification',
          duration: 5000,
        });
      };

      websocketService.addMessageHandler(messageHandler);
      websocketService.addNotificationHandler(notificationHandler);

      // Cleanup on unmount
      return () => {
        websocketService.removeMessageHandler(messageHandler);
        websocketService.removeNotificationHandler(notificationHandler);
        websocketService.disconnect();
        setMessagesConnected(false);
        setNotificationsConnected(false);
      };
    } else {
      // Disconnect if not authenticated
      websocketService.disconnect();
      setMessagesConnected(false);
      setNotificationsConnected(false);
    }
  }, [isAuthenticated]);

  // Send message through WebSocket
  const sendMessage = (message: WebSocketMessage) => {
    websocketService.sendMessage(message);
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Reconnect WebSocket connections
  const reconnect = () => {
    websocketService.reconnect();
  };

  // Update connection status based on individual socket states
  useEffect(() => {
    setIsConnected(messagesConnected && notificationsConnected);
  }, [messagesConnected, notificationsConnected]);

  // Context value
  const value = {
    isConnected,
    messagesConnected,
    notificationsConnected,
    sendMessage,
    messages,
    notifications,
    clearMessages,
    clearNotifications,
    reconnect,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export default WebSocketContext;
