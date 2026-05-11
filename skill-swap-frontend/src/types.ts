// Define the Skill type (base skill/category)
export interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Define the Teaching Skill type (user's skills they can teach)
export interface TeachingSkill {
  id: number;
  skill: number; // Foreign key to Skill
  skill_name: string; // Populated by backend
  category_name: string; // Populated by backend
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  created_at: string;
  updated_at: string;
  user: number; // Foreign key to User
}

// Define the Learning Skill type (user's skills they want to learn)
export interface LearningSkill {
  id: number;
  skill: number; // Foreign key to Skill
  skill_name: string; // Populated by backend
  category_name: string; // Populated by backend
  current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  goal: string;
  created_at: string;
  updated_at: string;
  user: number; // Foreign key to User
}

// Define the Skill Category type
export interface SkillCategory {
  id: number;
  name: string;
  description?: string;
}

// Define the User type (updated to match Django backend)
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  location?: string;
  bio?: string;
  teachSkills?: TeachingSkill[];
  learnSkills?: LearningSkill[];
  availability?: string[];
  date_joined?: string;
  rating?: number;
  sessionsCompleted?: number;
}

// Define API response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Define the Session type
export interface Session {
  id: string;
  teacher: User;
  student: User;
  skill: Skill;
  date: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

// Define the Message type
export interface Message {
  id: string;
  sender: User;
  recipient: User;
  content: string;
  timestamp: Date;
  read: boolean;
}

// Define the Stats type
export interface Stats {
  totalUsers: number;
  totalSkills: number;
  totalSessions: number;
}

// Define the Review type
export interface Review {
  id: string;
  session: Session;
  reviewer: User;
  reviewee: User;
  rating: number;
  comment?: string;
  timestamp: Date;
}

// Define the Challenge type
export interface Challenge {
  id: string;
  title: string;
  description: string;
  skillId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  durationMinutes: number;
  createdAt: Date;
}
