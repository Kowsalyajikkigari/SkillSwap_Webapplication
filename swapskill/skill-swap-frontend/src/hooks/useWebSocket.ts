import { useState, useEffect, useCallback } from 'react';
import { webSocketService, WebSocketMessage, MessageHandler } from '@/services/websocket.service';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  messagesConnected: boolean;
  notificationsConnected: boolean;
  addMessageHandler: (handler: MessageHandler) => void;
  removeMessageHandler: (handler: MessageHandler) => void;
  addNotificationHandler: (handler: MessageHandler) => void;
  removeNotificationHandler: (handler: MessageHandler) => void;
  sendMessage: (message: WebSocketMessage) => void;
  reconnect: () => void;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [messagesConnected, setMessagesConnected] = useState(false);
  const [notificationsConnected, setNotificationsConnected] = useState(false);

  // Monitor connection status
  useEffect(() => {
    const checkConnectionStatus = () => {
      const messagesStatus = webSocketService.isMessagesConnected();
      const notificationsStatus = webSocketService.isNotificationsConnected();
      
      setMessagesConnected(messagesStatus);
      setNotificationsConnected(notificationsStatus);

      if (messagesStatus && notificationsStatus) {
        setConnectionStatus('connected');
      } else if (messagesStatus || notificationsStatus) {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('disconnected');
      }
    };

    // Check status immediately
    checkConnectionStatus();

    // Set up interval to check status periodically
    const statusInterval = setInterval(checkConnectionStatus, 1000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  // Initialize WebSocket connections
  useEffect(() => {
    console.log('🔌 Initializing WebSocket connections from hook...');
    webSocketService.init();

    return () => {
      console.log('🔌 Cleaning up WebSocket connections...');
      webSocketService.disconnect();
    };
  }, []);

  const addMessageHandler = useCallback((handler: MessageHandler) => {
    webSocketService.addMessageHandler(handler);
  }, []);

  const removeMessageHandler = useCallback((handler: MessageHandler) => {
    webSocketService.removeMessageHandler(handler);
  }, []);

  const addNotificationHandler = useCallback((handler: MessageHandler) => {
    webSocketService.addNotificationHandler(handler);
  }, []);

  const removeNotificationHandler = useCallback((handler: MessageHandler) => {
    webSocketService.removeNotificationHandler(handler);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    webSocketService.sendMessage(message);
  }, []);

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested...');
    webSocketService.reconnect();
  }, []);

  return {
    connectionStatus,
    messagesConnected,
    notificationsConnected,
    addMessageHandler,
    removeMessageHandler,
    addNotificationHandler,
    removeNotificationHandler,
    sendMessage,
    reconnect,
  };
};
