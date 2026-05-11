import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Send, Paperclip, MessageCircle, Phone, Video, MoreVertical, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  markMessagesAsRead,
  realTimeMessaging,
  type Conversation,
  type Message as MessageType,
  type User
} from "@/services/messaging.service";

const InboxRealTime = () => {
  const { id, providerId } = useParams();
  const { user: currentUser } = useAuth();
  const { isConnected, messages: wsMessages } = useWebSocket();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<number, string>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle route parameters
  useEffect(() => {
    if (id) {
      setActiveConversation(parseInt(id));
    } else if (providerId) {
      // Handle new conversation with provider
      handleNewConversation(parseInt(providerId));
    }
  }, [id, providerId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
      realTimeMessaging.joinConversation(activeConversation);
    }
    
    return () => {
      if (activeConversation) {
        realTimeMessaging.leaveConversation(activeConversation);
      }
    };
  }, [activeConversation]);

  // Handle real-time WebSocket messages
  useEffect(() => {
    wsMessages.forEach(wsMessage => {
      if (wsMessage.type === 'chat_message' && wsMessage.message) {
        handleNewRealTimeMessage(wsMessage.message);
      } else if (wsMessage.type === 'typing_indicator') {
        handleTypingIndicator(wsMessage);
      }
    });
  }, [wsMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const data = await getMessages(conversationId);
      setMessages(data);
      
      // Mark messages as read
      await markMessagesAsRead(conversationId);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleNewConversation = async (userId: number) => {
    // Implementation for creating new conversation
    console.log('Creating new conversation with user:', userId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      
      const messageData = {
        conversation: activeConversation,
        content: newMessage.trim()
      };

      const sentMessage = await sendMessage(messageData);
      
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
      
      // Stop typing indicator
      realTimeMessaging.sendTypingIndicator(activeConversation, false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleNewRealTimeMessage = (message: MessageType) => {
    // Only add if it's for the current conversation and not from current user
    if (message.conversation === activeConversation && message.sender.id !== currentUser?.id) {
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        if (prev.some(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
      
      // Mark as read if conversation is active
      if (activeConversation === message.conversation) {
        markMessagesAsRead(message.conversation);
      }
    }
    
    // Update conversation list with new message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === message.conversation
          ? { 
              ...conv, 
              last_message_content: {
                id: message.id,
                content: message.content,
                sender_id: message.sender.id,
                created_at: message.created_at,
                is_read: message.is_read
              },
              unread_count: message.sender.id !== currentUser?.id ? conv.unread_count + 1 : conv.unread_count
            }
          : conv
      )
    );
  };

  const handleTypingIndicator = (wsMessage: any) => {
    if (wsMessage.conversation_id === activeConversation && wsMessage.user_id !== currentUser?.id) {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (wsMessage.is_typing) {
          newMap.set(wsMessage.user_id, wsMessage.user_name);
        } else {
          newMap.delete(wsMessage.user_id);
        }
        return newMap;
      });
    }
  };

  const handleTyping = () => {
    if (!activeConversation) return;
    
    realTimeMessaging.sendTypingIndicator(activeConversation, true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      realTimeMessaging.sendTypingIndicator(activeConversation, false);
    }, 1000);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(
    conv => {
      const otherUser = conv.participants_details.find(p => p.id !== currentUser?.id);
      return otherUser && (
        otherUser.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        otherUser.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        otherUser.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  // Get active conversation details
  const activeConv = conversations.find(conv => conv.id === activeConversation);
  const otherUser = activeConv?.participants_details.find(p => p.id !== currentUser?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading conversations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Conversations List */}
          <div className="md:w-1/3 lg:w-1/4">
            <Card className="h-[calc(100vh-8rem)]">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Messages</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-muted-foreground">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto h-[calc(100%-8rem)]">
                <div className="space-y-1">
                  {filteredConversations.map(conv => {
                    const user = conv.participants_details.find(p => p.id !== currentUser?.id);
                    if (!user) return null;
                    
                    return (
                      <div
                        key={conv.id}
                        className={`p-3 hover:bg-muted/50 cursor-pointer ${activeConversation === conv.id ? 'bg-muted' : ''}`}
                        onClick={() => setActiveConversation(conv.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.first_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium truncate">{user.first_name} {user.last_name}</h3>
                              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {conv.last_message_content && new Date(conv.last_message_content.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                              {conv.last_message_content?.content || 'No messages yet'}
                            </p>
                            {conv.unread_count > 0 && (
                              <Badge className="mt-1 text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Separator className="mt-3" />
                      </div>
                    );
                  })}

                  {filteredConversations.length === 0 && (
                    <div className="p-6 text-center">
                      <p className="text-muted-foreground">No conversations found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="md:w-2/3 lg:w-3/4">
            <Card className="h-[calc(100vh-8rem)]">
              {activeConv && otherUser ? (
                <>
                  <CardHeader className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={otherUser.avatar} />
                          <AvatarFallback>{otherUser.first_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {otherUser.first_name} {otherUser.last_name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {typingUsers.size > 0 ? 'Typing...' : 'Online'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="flex flex-col h-[calc(100%-8rem)]">
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-6">
                        {messages.map((message) => (
                          <div key={message.id} className={`flex ${message.sender.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex items-end gap-2 max-w-[80%]">
                              {message.sender.id !== currentUser?.id && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={message.sender.avatar} />
                                  <AvatarFallback>{message.sender.first_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div className={`rounded-lg p-3 ${message.sender.id === currentUser?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    <div className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Button type="button" variant="ghost" size="icon">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                          }}
                          className="flex-1"
                          disabled={sendingMessage}
                        />
                        <Button type="submit" size="icon" disabled={sendingMessage || !newMessage.trim()}>
                          {sendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                      </form>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageCircle className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Select a conversation from the list or start a new one by browsing members.
                  </p>
                  <Link to="/search">
                    <Button>Find Members</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxRealTime;
