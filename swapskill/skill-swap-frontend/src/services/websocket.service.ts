/**
 * WebSocket Service
 *
 * This service handles WebSocket connections for real-time features
 * like messaging and notifications.
 */

import { WEBSOCKET_ENDPOINTS } from '../config/api.config';
import { getToken } from './auth.service';

// Types
export interface WebSocketMessage {
  type: string;
  payload?: any;
  message?: any;
  notification?: any;
  timestamp?: string;
  user_id?: number;
  user_name?: string;
  is_typing?: boolean;
  conversation_id?: number;
}

export type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketService {
  private messagesSocket: WebSocket | null = null;
  private notificationsSocket: WebSocket | null = null;
  private messageHandlers: MessageHandler[] = [];
  private notificationHandlers: MessageHandler[] = [];
  private messagesReconnectAttempts = 0;
  private notificationsReconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private messagesReconnectTimeout: NodeJS.Timeout | null = null;
  private notificationsReconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isMessagesConnecting = false;
  private isNotificationsConnecting = false;
  private connectionStatusCallback: ((messagesConnected: boolean, notificationsConnected: boolean) => void) | null = null;
  private rateLimitBackoffMs = 5000; // Start with 5 second backoff for rate limiting

  /**
   * Initialize WebSocket connections
   */
  public init(): void {
    try {
      // Check if WebSocket is enabled in environment
      const wsEnabled = import.meta.env.VITE_WEBSOCKET_ENABLED === 'true';
      
      if (wsEnabled) {
        console.log('🔌 Initializing WebSocket connections...');
        this.connectMessagesSocket();
        this.connectNotificationsSocket();
        this.setupPingInterval();
      } else {
        console.log('WebSocket connections disabled - using HTTP polling for real-time features');
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket connections:', error);
      // Continue without WebSockets - app should still function
    }
  }

  /**
   * Connect to messages WebSocket
   */
  private connectMessagesSocket(): void {
    // Prevent multiple simultaneous connection attempts
    if (this.isMessagesConnecting || this.messagesSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      this.isMessagesConnecting = true;
      this.messagesSocket = new WebSocket(`${WEBSOCKET_ENDPOINTS.MESSAGES}?token=${token}`);

      this.messagesSocket.onopen = () => {
        console.log('✅ Messages WebSocket connected');
        this.messagesReconnectAttempts = 0;
        this.isMessagesConnecting = false;
        this.rateLimitBackoffMs = 5000; // Reset backoff on successful connection
        this.notifyConnectionStatus();
      };

      this.messagesSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.messageHandlers.forEach(handler => handler(message));
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.messagesSocket.onclose = (event) => {
        console.log(`📤 Messages WebSocket disconnected: ${event.code} - ${event.reason || 'No reason'}`);
        this.isMessagesConnecting = false;
        this.notifyConnectionStatus();

        // Don't reconnect if it was a normal closure (user initiated)
        if (event.code !== 1000 && event.code !== 1001) {
          if (event.code === 1008 || event.code === 1006) {
            console.warn('⚠️ Messages WebSocket closed due to rate limiting, using exponential backoff');
            // Use longer backoff for rate limiting
            setTimeout(() => this.handleReconnect('messages'), this.rateLimitBackoffMs);
            this.rateLimitBackoffMs = Math.min(this.rateLimitBackoffMs * 2, 60000); // Max 1 minute
          } else {
            this.handleReconnect('messages');
          }
        } else {
          console.log('✅ Messages WebSocket closed normally, not reconnecting');
        }
      };

      this.messagesSocket.onerror = (error) => {
        console.error('❌ Messages WebSocket error:', error);
        this.isMessagesConnecting = false;
      };
    } catch (error) {
      console.error('Error connecting to messages WebSocket:', error);
      this.handleReconnect('messages');
    }
  }

  /**
   * Connect to notifications WebSocket
   */
  private connectNotificationsSocket(): void {
    // Prevent multiple simultaneous connection attempts
    if (this.isNotificationsConnecting || this.notificationsSocket?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      this.isNotificationsConnecting = true;
      this.notificationsSocket = new WebSocket(`${WEBSOCKET_ENDPOINTS.NOTIFICATIONS}?token=${token}`);

      this.notificationsSocket.onopen = () => {
        console.log('✅ Notifications WebSocket connected');
        this.notificationsReconnectAttempts = 0;
        this.isNotificationsConnecting = false;
        this.rateLimitBackoffMs = 5000; // Reset backoff on successful connection
        this.notifyConnectionStatus();
      };

      this.notificationsSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.notificationHandlers.forEach(handler => handler(message));
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.notificationsSocket.onclose = (event) => {
        console.log(`🔔 Notifications WebSocket disconnected: ${event.code} - ${event.reason || 'No reason'}`);
        this.isNotificationsConnecting = false;
        this.notifyConnectionStatus();

        // Don't reconnect if it was a normal closure (user initiated)
        if (event.code !== 1000 && event.code !== 1001) {
          if (event.code === 1008 || event.code === 1006) {
            console.warn('⚠️ Notifications WebSocket closed due to rate limiting, using exponential backoff');
            // Use longer backoff for rate limiting
            setTimeout(() => this.handleReconnect('notifications'), this.rateLimitBackoffMs);
            this.rateLimitBackoffMs = Math.min(this.rateLimitBackoffMs * 2, 60000); // Max 1 minute
          } else {
            this.handleReconnect('notifications');
          }
        } else {
          console.log('✅ Notifications WebSocket closed normally, not reconnecting');
        }
      };

      this.notificationsSocket.onerror = (error) => {
        console.error('❌ Notifications WebSocket error:', error);
        this.isNotificationsConnecting = false;
      };
    } catch (error) {
      console.error('Error connecting to notifications WebSocket:', error);
      this.handleReconnect('notifications');
    }
  }

  /**
   * Handle reconnection logic with separate tracking for each socket
   */
  private handleReconnect(socketType: 'messages' | 'notifications'): void {
    const isMessages = socketType === 'messages';
    const attempts = isMessages ? this.messagesReconnectAttempts : this.notificationsReconnectAttempts;
    const timeout = isMessages ? this.messagesReconnectTimeout : this.notificationsReconnectTimeout;

    if (attempts >= this.maxReconnectAttempts) {
      console.log(`❌ Max reconnect attempts reached for ${socketType} socket`);
      return;
    }

    // Increment attempts
    if (isMessages) {
      this.messagesReconnectAttempts++;
    } else {
      this.notificationsReconnectAttempts++;
    }

    // Exponential backoff with jitter: 2s, 4s, 8s, 16s, 32s, 60s max
    const baseDelay = Math.min(1000 * 2 ** attempts, 60000);
    const jitter = Math.random() * 1000; // Add up to 1s jitter
    const delay = baseDelay + jitter;

    // Clear existing timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      const currentAttempts = isMessages ? this.messagesReconnectAttempts : this.notificationsReconnectAttempts;
      console.log(`🔄 Attempting to reconnect ${socketType} socket (${currentAttempts}/${this.maxReconnectAttempts})`);

      if (socketType === 'messages') {
        this.connectMessagesSocket();
      } else {
        this.connectNotificationsSocket();
      }
    }, delay);

    // Store timeout reference
    if (isMessages) {
      this.messagesReconnectTimeout = newTimeout;
    } else {
      this.notificationsReconnectTimeout = newTimeout;
    }
  }

  /**
   * Setup ping interval to keep connection alive
   */
  private setupPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    // Send ping every 2 minutes to keep connection alive (reduced from 30s to prevent disconnections)
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 120000);
  }

  /**
   * Send ping to keep connection alive
   */
  private sendPing(): void {
    if (this.messagesSocket && this.messagesSocket.readyState === WebSocket.OPEN) {
      this.messagesSocket.send(JSON.stringify({ type: 'ping' }));
    }

    if (this.notificationsSocket && this.notificationsSocket.readyState === WebSocket.OPEN) {
      this.notificationsSocket.send(JSON.stringify({ type: 'ping' }));
    }
  }

  /**
   * Get connection status for messages socket
   */
  public isMessagesConnected(): boolean {
    return this.messagesSocket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status for notifications socket
   */
  public isNotificationsConnected(): boolean {
    return this.notificationsSocket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get overall connection status
   */
  public isConnected(): boolean {
    return this.isMessagesConnected() && this.isNotificationsConnected();
  }

  /**
   * Set connection status callback
   */
  public setConnectionStatusCallback(callback: (messagesConnected: boolean, notificationsConnected: boolean) => void): void {
    this.connectionStatusCallback = callback;
  }

  /**
   * Notify connection status change
   */
  private notifyConnectionStatus(): void {
    if (this.connectionStatusCallback) {
      this.connectionStatusCallback(this.isMessagesConnected(), this.isNotificationsConnected());
    }
  }

  /**
   * Send message through WebSocket
   * @param message - Message to send
   */
  public sendMessage(message: WebSocketMessage): void {
    if (this.messagesSocket && this.messagesSocket.readyState === WebSocket.OPEN) {
      this.messagesSocket.send(JSON.stringify(message));
    } else {
      console.error('Messages WebSocket not connected');
    }
  }

  /**
   * Send typing indicator
   * @param conversationId - ID of the conversation
   * @param isTyping - Whether user is typing
   */
  public sendTypingIndicator(conversationId: number, isTyping: boolean): void {
    this.sendMessage({
      type: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping
    });
  }

  /**
   * Join conversation for typing indicators
   * @param conversationId - ID of the conversation to join
   */
  public joinConversation(conversationId: number): void {
    this.sendMessage({
      type: 'join_conversation',
      conversation_id: conversationId
    });
  }

  /**
   * Leave conversation
   * @param conversationId - ID of the conversation to leave
   */
  public leaveConversation(conversationId: number): void {
    this.sendMessage({
      type: 'leave_conversation',
      conversation_id: conversationId
    });
  }

  /**
   * Add message handler
   * @param handler - Function to handle incoming messages
   */
  public addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Remove message handler
   * @param handler - Handler to remove
   */
  public removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  /**
   * Add notification handler
   * @param handler - Function to handle incoming notifications
   */
  public addNotificationHandler(handler: MessageHandler): void {
    this.notificationHandlers.push(handler);
  }

  /**
   * Remove notification handler
   * @param handler - Handler to remove
   */
  public removeNotificationHandler(handler: MessageHandler): void {
    this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
  }





  /**
   * Manually reconnect WebSocket connections
   */
  public reconnect(): void {
    console.log('🔄 Reconnecting WebSocket connections...');
    this.disconnect();
    setTimeout(() => {
      this.init();
    }, 1000);
  }

  /**
   * Close WebSocket connections
   */
  public disconnect(): void {
    // Reset connection states
    this.isMessagesConnecting = false;
    this.isNotificationsConnecting = false;
    this.rateLimitBackoffMs = 5000; // Reset backoff

    if (this.messagesSocket) {
      this.messagesSocket.close();
      this.messagesSocket = null;
    }

    if (this.notificationsSocket) {
      this.notificationsSocket.close();
      this.notificationsSocket = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.messagesReconnectTimeout) {
      clearTimeout(this.messagesReconnectTimeout);
      this.messagesReconnectTimeout = null;
    }

    if (this.notificationsReconnectTimeout) {
      clearTimeout(this.notificationsReconnectTimeout);
      this.notificationsReconnectTimeout = null;
    }

    this.messageHandlers = [];
    this.notificationHandlers = [];
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export { websocketService as webSocketService };
export default websocketService;
