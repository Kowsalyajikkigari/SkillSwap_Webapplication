/**
 * Search and Discovery Types for SkillSwap
 */

export interface SkillProvider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location: {
    city: string;
    state?: string;
    country: string;
    coordinates?: [number, number];
  };
  rating: {
    average: number;
    count: number;
  };
  skills: SkillOffering[];
  availability: {
    isAvailable: boolean;
    nextAvailable?: string;
    timeSlots?: string[];
  };
  pricing: {
    hourlyRate: number;
    currency: string;
  };
  experience: {
    sessionsCompleted: number;
    yearsExperience: number;
  };
  verified: boolean;
  responseTime: string; // e.g., "Usually responds within 2 hours"
}

export interface SkillOffering {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  description: string;
  tags: string[];
  price: number;
  duration: number; // in minutes
  sessionType: SessionType[];
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type SessionType = 'One-time' | 'Ongoing' | 'Group' | 'Private';
export type SortOption = 'relevance' | 'rating' | 'price' | 'distance' | 'availability';
export type ViewMode = 'grid' | 'list';

export interface SearchFilters {
  query: string;
  categories: string[];
  skillLevels: SkillLevel[];
  location: {
    city?: string;
    radius?: number; // in miles
  };
  availability: {
    availableToday?: boolean;
    availableThisWeek?: boolean;
  };
  rating: {
    minimum: number;
  };
  priceRange: {
    min?: number;
    max?: number;
    free?: boolean;
  };
  sessionTypes: SessionType[];
  sortBy: SortOption;
}

export interface SearchResults {
  providers: SkillProvider[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchState {
  filters: SearchFilters;
  results: SearchResults | null;
  isLoading: boolean;
  error: string | null;
  viewMode: ViewMode;
}

// Default search filters
export const defaultSearchFilters: SearchFilters = {
  query: '',
  categories: [],
  skillLevels: [],
  location: {},
  availability: {},
  rating: { minimum: 0 },
  priceRange: {},
  sessionTypes: [],
  sortBy: 'relevance'
};

// Skill categories data
export const skillCategories: SkillCategory[] = [
  { id: 'programming', name: 'Programming', icon: '💻', color: 'bg-blue-100 text-blue-800' },
  { id: 'design', name: 'Design', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
  { id: 'languages', name: 'Languages', icon: '🌍', color: 'bg-green-100 text-green-800' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'bg-pink-100 text-pink-800' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-orange-100 text-orange-800' },
  { id: 'cooking', name: 'Cooking', icon: '👨‍🍳', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'business', name: 'Business', icon: '💼', color: 'bg-gray-100 text-gray-800' },
  { id: 'photography', name: 'Photography', icon: '📸', color: 'bg-indigo-100 text-indigo-800' },
];

// Skill levels
export const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

// Sort options
export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price', label: 'Lowest Price' },
  { value: 'distance', label: 'Nearest' },
  { value: 'availability', label: 'Available Now' },
];
