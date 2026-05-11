import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Calendar, Paperclip, Send, Phone, Video, MoreHorizontal, Search, Info, Star, MessageCircle } from "lucide-react";

// Mock conversations data
const mockConversations = [
  {
    id: 1,
    user: {
      id: 2,
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=68",
      online: true
    },
    lastMessage: {
      text: "That sounds great! When would you like to schedule our first session?",
      time: "10:42 AM",
      isRead: false,
      isFromMe: false
    },
    unreadCount: 1,
    skill: "Web Development"
  },
  {
    id: 2,
    user: {
      id: 3,
      name: "Alex Lee",
      avatar: "https://i.pravatar.cc/150?img=47",
      online: false
    },
    lastMessage: {
      text: "I've sent you some examples of my photography work. Let me know what you think!",
      time: "Yesterday",
      isRead: true,
      isFromMe: false
    },
    unreadCount: 0,
    skill: "Photography"
  },
  {
    id: 3,
    user: {
      id: 4,
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=5",
      online: true
    },
    lastMessage: {
      text: "Thanks for the digital marketing tips! They've been really helpful.",
      time: "Yesterday",
      isRead: true,
      isFromMe: true
    },
    unreadCount: 0,
    skill: "Digital Marketing"
  },
  {
    id: 4,
    user: {
      id: 5,
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=15",
      online: false
    },
    lastMessage: {
      text: "I'm available this weekend for our mobile app development session.",
      time: "Monday",
      isRead: true,
      isFromMe: false
    },
    unreadCount: 0,
    skill: "Mobile App Development"
  },
  {
    id: 5,
    user: {
      id: 6,
      name: "Emily Wilson",
      avatar: "https://i.pravatar.cc/150?img=23",
      online: true
    },
    lastMessage: {
      text: "I've reviewed your writing sample. Let's discuss it in our next session.",
      time: "Last week",
      isRead: true,
      isFromMe: false
    },
    unreadCount: 0,
    skill: "Content Writing"
  }
];

// Mock messages for a conversation
const mockMessages = [
  {
    id: 1,
    text: "Hi John! I saw that you're offering web development lessons. I'm interested in learning React.",
    time: "10:30 AM",
    isFromMe: true,
    date: "Today"
  },
  {
    id: 2,
    text: "Hey there! Yes, I'd be happy to teach you React. I've been working with it for about 3 years now.",
    time: "10:35 AM",
    isFromMe: false,
    date: "Today"
  },
  {
    id: 3,
    text: "Great! I'm a complete beginner with React, but I have some experience with HTML, CSS, and basic JavaScript.",
    time: "10:38 AM",
    isFromMe: true,
    date: "Today"
  },
  {
    id: 4,
    text: "That's a good foundation to start with. We can begin with the basics of React components, state, and props, then move on to more advanced topics.",
    time: "10:40 AM",
    isFromMe: false,
    date: "Today"
  },
  {
    id: 5,
    text: "I see you're also interested in learning graphic design. I could definitely use some help with that for my portfolio website.",
    time: "10:41 AM",
    isFromMe: false,
    date: "Today"
  },
  {
    id: 6,
    text: "That sounds great! When would you like to schedule our first session?",
    time: "10:42 AM",
    isFromMe: false,
    date: "Today"
  }
];

const Inbox = () => {
  const { id, providerId } = useParams();
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize active conversation based on route parameters
  useEffect(() => {
    if (id) {
      // Direct message route: /message/:id or /inbox/:id
      setActiveConversation(parseInt(id));
    } else if (providerId) {
      // New message route: /messages/new/:providerId
      // Find existing conversation with this provider or create a new one
      const existingConv = conversations.find(conv => conv.user.id === parseInt(providerId));
      if (existingConv) {
        setActiveConversation(existingConv.id);
      } else {
        // Create a new conversation (in a real app, this would be handled by the backend)
        console.log(`Starting new conversation with provider ${providerId}`);
        setActiveConversation(1); // Default to first conversation for now
      }
    }
  }, [id, providerId, conversations]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    conv => conv.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFromMe: true,
      date: "Today"
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  // Get active conversation details
  const getActiveConversation = () => {
    if (!activeConversation) return null;
    return conversations.find(conv => conv.id === activeConversation);
  };

  const activeConv = getActiveConversation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Conversations List */}
          <div className="md:w-1/3 lg:w-1/4">
            <Card className="h-[calc(100vh-8rem)]">
              <CardHeader className="p-4">
                <CardTitle className="text-xl">Messages</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Tabs defaultValue="all" className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="archived">Archived</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto h-[calc(100%-8rem)]">
                <div className="space-y-1">
                  {filteredConversations.map(conv => (
                    <div
                      key={conv.id}
                      className={`p-3 hover:bg-muted/50 cursor-pointer ${activeConversation === conv.id ? 'bg-muted' : ''}`}
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conv.user.avatar} />
                            <AvatarFallback>{conv.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {conv.user.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">{conv.user.name}</h3>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{conv.lastMessage.time}</span>
                          </div>
                          <p className={`text-sm truncate ${conv.unreadCount > 0 && !conv.lastMessage.isFromMe ? 'font-medium' : 'text-muted-foreground'}`}>
                            {conv.lastMessage.isFromMe && "You: "}
                            {conv.lastMessage.text}
                          </p>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {conv.skill}
                            </Badge>
                            {conv.unreadCount > 0 && (
                              <Badge className="ml-auto text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-3" />
                    </div>
                  ))}

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
              {activeConv ? (
                <>
                  <CardHeader className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={activeConv.user.avatar} />
                          <AvatarFallback>{activeConv.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {activeConv.user.name}
                            {activeConv.user.online && (
                              <span className="ml-2 h-2 w-2 rounded-full bg-green-500"></span>
                            )}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {activeConv.user.online ? 'Online' : 'Offline'}
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
                          <Info className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <div className="flex flex-col h-[calc(100%-8rem)]">
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-6">
                        {messages.map((message, index) => {
                          // Check if we need to show date separator
                          const showDate = index === 0 || messages[index - 1].date !== message.date;

                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="flex justify-center my-4">
                                  <Badge variant="outline" className="text-xs px-2 py-1">
                                    {message.date}
                                  </Badge>
                                </div>
                              )}
                              <div className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}>
                                <div className="flex items-end gap-2 max-w-[80%]">
                                  {!message.isFromMe && (
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={activeConv.user.avatar} />
                                      <AvatarFallback>{activeConv.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                  )}
                                  <div>
                                    <div className={`rounded-lg p-3 ${message.isFromMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                      <p className="text-sm">{message.text}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{message.time}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" size="icon">
                          <Send className="h-5 w-5" />
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
                  <Link to="/explore">
                    <Button>
                      Find Members
                    </Button>
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

export default Inbox;
