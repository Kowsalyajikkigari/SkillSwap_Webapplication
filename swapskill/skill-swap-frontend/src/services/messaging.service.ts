/**
 * Real-time Messaging Service
 * 
 * This service handles real-time messaging functionality including
 * conversations, messages, and live updates.
 */

import { get, post } from './api.service';
import { MESSAGE_ENDPOINTS } from '@/config/api.config';
import websocketService from './websocket.service';

// Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: User;
  content: string;
  is_read: boolean;
  created_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  file: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  participants: number[];
  participants_details: User[];
  created_at: string;
  updated_at: string;
  last_message_content?: {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
    is_read: boolean;
  };
  unread_count: number;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface CreateMessageData {
  conversation: number;
  content: string;
  attachments?: File[];
}

/**
 * Get all conversations for the current user
 */
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    console.log('📥 Fetching conversations...');
    const response = await get<Conversation[]>(MESSAGE_ENDPOINTS.GET_CONVERSATIONS);
    console.log('✅ Conversations fetched:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get a specific conversation with messages
 */
export const getConversation = async (conversationId: number): Promise<ConversationDetail> => {
  try {
    console.log(`📥 Fetching conversation ${conversationId}...`);
    const response = await get<ConversationDetail>(MESSAGE_ENDPOINTS.GET_CONVERSATION(conversationId.toString()));
    console.log('✅ Conversation fetched:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId: number): Promise<Message[]> => {
  try {
    console.log(`📥 Fetching messages for conversation ${conversationId}...`);
    const response = await get<Message[]>(MESSAGE_ENDPOINTS.GET_MESSAGES(conversationId.toString()));
    console.log('✅ Messages fetched:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a new message
 */
export const sendMessage = async (messageData: CreateMessageData): Promise<Message> => {
  try {
    console.log('📤 Sending message:', messageData);
    
    // If there are attachments, use FormData
    if (messageData.attachments && messageData.attachments.length > 0) {
      const formData = new FormData();
      formData.append('conversation', messageData.conversation.toString());
      formData.append('content', messageData.content);
      
      messageData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
      
      const response = await post<Message>(MESSAGE_ENDPOINTS.SEND_MESSAGE, formData);
      console.log('✅ Message sent with attachments:', response);
      return response;
    } else {
      // Regular message without attachments
      const response = await post<Message>(MESSAGE_ENDPOINTS.SEND_MESSAGE, {
        conversation: messageData.conversation,
        content: messageData.content
      });
      console.log('✅ Message sent:', response);
      return response;
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId: number): Promise<void> => {
  try {
    console.log(`📖 Marking messages as read for conversation ${conversationId}...`);
    await post(MESSAGE_ENDPOINTS.MARK_AS_READ(conversationId.toString()), {});
    console.log('✅ Messages marked as read');
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Create or get conversation with a user
 */
export const createConversation = async (userId: number): Promise<Conversation> => {
  try {
    console.log(`💬 Creating conversation with user ${userId}...`);
    const response = await post<Conversation>('/messages/conversations/with_user/', {
      user_id: userId
    });
    console.log('✅ Conversation created/found:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    throw error;
  }
};

/**
 * Real-time messaging utilities
 */
export class RealTimeMessaging {
  private typingTimeouts: Map<number, NodeJS.Timeout> = new Map();
  private currentConversationId: number | null = null;

  /**
   * Join a conversation for real-time updates
   */
  joinConversation(conversationId: number): void {
    if (this.currentConversationId) {
      this.leaveConversation(this.currentConversationId);
    }
    
    this.currentConversationId = conversationId;
    websocketService.joinConversation(conversationId);
    console.log(`🔗 Joined conversation ${conversationId} for real-time updates`);
  }

  /**
   * Leave current conversation
   */
  leaveConversation(conversationId: number): void {
    websocketService.leaveConversation(conversationId);
    
    // Clear typing timeout
    const timeout = this.typingTimeouts.get(conversationId);
    if (timeout) {
      clearTimeout(timeout);
      this.typingTimeouts.delete(conversationId);
    }
    
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
    
    console.log(`🔌 Left conversation ${conversationId}`);
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: number, isTyping: boolean): void {
    websocketService.sendTypingIndicator(conversationId, isTyping);
    
    if (isTyping) {
      // Clear existing timeout
      const existingTimeout = this.typingTimeouts.get(conversationId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Set new timeout to stop typing after 3 seconds
      const timeout = setTimeout(() => {
        websocketService.sendTypingIndicator(conversationId, false);
        this.typingTimeouts.delete(conversationId);
      }, 3000);
      
      this.typingTimeouts.set(conversationId, timeout);
    }
  }

  /**
   * Cleanup all timeouts
   */
  cleanup(): void {
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    if (this.currentConversationId) {
      this.leaveConversation(this.currentConversationId);
    }
  }
}

// Create singleton instance
export const realTimeMessaging = new RealTimeMessaging();

export default {
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  createConversation,
  realTimeMessaging
};
