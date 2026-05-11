// Core Types for SkillSwap Application

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location?: string;
  bio?: string;
  teachSkills: Skill[];
  learnSkills: Skill[];
  availability: string[];
  joinedDate: Date;
  rating: number;
  sessionsCompleted: number;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface Stats {
  totalUsers: number;
  totalSkills: number;
  totalSessions: number;
}

export interface Session {
  id: string;
  teacherId: string;
  learnerId: string;
  skill: Skill;
  date: Date;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: 'virtual' | 'in-person';
  location?: string;
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  sessionId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'session_request' | 'session_confirmed' | 'review' | 'system';
  title: string;
  content: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: string;
  status: 'available' | 'in_progress' | 'completed';
  deadline?: Date;
  participants: number;
  maxParticipants?: number;
}

export interface UserProgress {
  userId: string;
  level: number;
  points: number;
  badges: Badge[];
  skillsLearned: number;
  skillsTaught: number;
  hoursExchanged: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  avatar?: File;
  teachSkills: string[];
  learnSkills: string[];
  availability: string[];
}

export interface SessionRequestForm {
  teacherId: string;
  skillId: string;
  preferredDate: Date;
  duration: number;
  type: 'virtual' | 'in-person';
  message: string;
}

// Filter and Search Types
export interface SkillFilter {
  category?: string;
  level?: string;
  location?: string;
  availability?: string;
  rating?: number;
}

export interface UserFilter {
  skills?: string[];
  location?: string;
  availability?: string;
  rating?: number;
  sortBy?: 'rating' | 'distance' | 'recent' | 'popular';
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'message' | 'notification' | 'status' | 'typing';
  payload: any;
  timestamp: Date;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp: Date;
}

export interface UserAnalytics {
  pageViews: number;
  sessionRequests: number;
  messagesExchanged: number;
  skillsShared: number;
  averageRating: number;
  totalHours: number;
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Component Props Types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface FormProps extends ComponentProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  error?: string;
}

// State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
  skills: Skill[];
  users: User[];
  sessions: Session[];
  messages: Message[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  exact?: boolean;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export default {
  Skill,
  User,
  Stats,
  Session,
  Message,
  Conversation,
  Review,
  Notification,
  Badge,
  UserProgress,
  ApiResponse,
  PaginatedResponse,
  LoginForm,
  RegisterForm,
  ProfileForm,
  SessionRequestForm,
  SkillFilter,
  UserFilter,
  WebSocketMessage,
  AnalyticsEvent,
  UserAnalytics,
  ApiError,
  ComponentProps,
  ModalProps,
  FormProps,
  AuthState,
  AppState,
  RouteConfig,
  Theme,
};
