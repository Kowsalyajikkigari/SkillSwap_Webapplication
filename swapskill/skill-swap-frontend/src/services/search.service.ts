/**
 * Search Service for SkillSwap
 * Handles API calls for skill and provider search functionality
 */

import api from './api.service';
import { SKILL_ENDPOINTS } from '../config/api.config';
import { SearchFilters, SearchResults, SkillProvider, SkillCategory } from '../types/search.types';

export interface SearchApiParams {
  query?: string;
  categories?: string[];
  skill_levels?: string[];
  location?: string;
  radius?: number;
  min_rating?: number;
  min_price?: number;
  max_price?: number;
  available_today?: boolean;
  available_this_week?: boolean;
  session_types?: string[];
  sort_by?: string;
  page?: number;
  page_size?: number;
}

/**
 * Search for skill providers based on filters
 */
export const searchSkillProviders = async (
  filters: SearchFilters,
  page: number = 1,
  pageSize: number = 12
): Promise<SearchResults> => {
  try {
    // Convert frontend filters to API parameters
    const params: SearchApiParams = {
      page,
      page_size: pageSize,
      sort_by: filters.sortBy,
    };

    // Add search query
    if (filters.query.trim()) {
      params.query = filters.query.trim();
    }

    // Add category filters
    if (filters.categories.length > 0) {
      params.categories = filters.categories;
    }

    // Add skill level filters
    if (filters.skillLevels.length > 0) {
      params.skill_levels = filters.skillLevels;
    }

    // Add location filters
    if (filters.location.city) {
      params.location = filters.location.city;
    }
    if (filters.location.radius) {
      params.radius = filters.location.radius;
    }

    // Add rating filter
    if (filters.rating.minimum > 0) {
      params.min_rating = filters.rating.minimum;
    }

    // Add price filters
    if (filters.priceRange.min !== undefined) {
      params.min_price = filters.priceRange.min;
    }
    if (filters.priceRange.max !== undefined) {
      params.max_price = filters.priceRange.max;
    }

    // Add availability filters
    if (filters.availability.availableToday) {
      params.available_today = true;
    }
    if (filters.availability.availableThisWeek) {
      params.available_this_week = true;
    }

    // Add session type filters
    if (filters.sessionTypes.length > 0) {
      params.session_types = filters.sessionTypes;
    }

    console.log('🔍 Search API call with params:', params);

    // Make API call
    const response = await api.get<{
      results: any[];
      count: number;
      next: string | null;
      previous: string | null;
    }>(SKILL_ENDPOINTS.GET_TEACHING_SKILLS, { params });

    // Transform API response to frontend format
    const providers: SkillProvider[] = response.results.map(transformApiProviderToFrontend);

    const totalCount = response.count;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      providers,
      totalCount,
      currentPage: page,
      totalPages,
      hasMore: !!response.next,
    };
  } catch (error) {
    console.error('❌ Search API error:', error);
    throw new Error('Failed to search skill providers. Please try again.');
  }
};

/**
 * Get skill categories
 */
export const getSkillCategories = async (): Promise<SkillCategory[]> => {
  try {
    const response = await api.get<SkillCategory[]>(SKILL_ENDPOINTS.GET_CATEGORIES);
    return response;
  } catch (error) {
    console.error('❌ Categories API error:', error);
    // Return default categories if API fails
    return [
      { id: 'programming', name: 'Programming', icon: '💻', color: 'bg-blue-100 text-blue-800' },
      { id: 'design', name: 'Design', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
      { id: 'languages', name: 'Languages', icon: '🌍', color: 'bg-green-100 text-green-800' },
      { id: 'music', name: 'Music', icon: '🎵', color: 'bg-pink-100 text-pink-800' },
      { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-orange-100 text-orange-800' },
    ];
  }
};

/**
 * Transform API provider data to frontend format
 */
const transformApiProviderToFrontend = (apiProvider: any): SkillProvider => {
  return {
    id: apiProvider.id || apiProvider.user?.id || Math.random().toString(),
    firstName: apiProvider.user?.first_name || apiProvider.first_name || 'Unknown',
    lastName: apiProvider.user?.last_name || apiProvider.last_name || 'User',
    email: apiProvider.user?.email || apiProvider.email || '',
    avatar: apiProvider.user?.avatar || apiProvider.avatar,
    bio: apiProvider.bio || apiProvider.description,
    location: {
      city: apiProvider.location?.city || 'Remote',
      state: apiProvider.location?.state,
      country: apiProvider.location?.country || 'Online',
    },
    rating: {
      average: apiProvider.rating || 4.5,
      count: apiProvider.review_count || Math.floor(Math.random() * 50) + 10,
    },
    skills: apiProvider.skills || [{
      id: apiProvider.id,
      name: apiProvider.skill?.name || apiProvider.name || 'General Skill',
      category: {
        id: apiProvider.skill?.category || 'general',
        name: apiProvider.skill?.category_name || 'General',
        icon: '🎯',
        color: 'bg-gray-100 text-gray-800'
      },
      level: apiProvider.level || 'Intermediate',
      description: apiProvider.description || '',
      tags: apiProvider.tags || [],
      price: apiProvider.price || 45,
      duration: apiProvider.duration || 60,
      sessionType: ['Private', 'One-time']
    }],
    availability: {
      isAvailable: apiProvider.is_available !== false,
      nextAvailable: apiProvider.next_available,
      timeSlots: apiProvider.time_slots || [],
    },
    pricing: {
      hourlyRate: apiProvider.price || apiProvider.hourly_rate || 45,
      currency: 'USD',
    },
    experience: {
      sessionsCompleted: apiProvider.sessions_completed || Math.floor(Math.random() * 200) + 50,
      yearsExperience: apiProvider.years_experience || Math.floor(Math.random() * 10) + 1,
    },
    verified: apiProvider.verified !== false,
    responseTime: apiProvider.response_time || 'Usually responds within 2 hours',
  };
};

/**
 * Mock data for development when API is not available
 */
export const getMockSearchResults = (filters: SearchFilters, page: number = 1): SearchResults => {
  const mockProviders: SkillProvider[] = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Full-stack developer with 5+ years of experience in React and Node.js',
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      rating: { average: 4.9, count: 127 },
      skills: [{
        id: '1',
        name: 'React Development',
        category: { id: 'programming', name: 'Programming', icon: '💻', color: 'bg-blue-100 text-blue-800' },
        level: 'Expert',
        description: 'Modern React with hooks, context, and best practices',
        tags: ['React', 'JavaScript', 'TypeScript', 'Redux'],
        price: 75,
        duration: 60,
        sessionType: ['Private', 'One-time']
      }],
      availability: { isAvailable: true, nextAvailable: 'Today' },
      pricing: { hourlyRate: 75, currency: 'USD' },
      experience: { sessionsCompleted: 234, yearsExperience: 5 },
      verified: true,
      responseTime: 'Usually responds within 1 hour'
    },
    {
      id: '2',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael@example.com',
      avatar: 'https://i.pravatar.cc/150?img=2',
      bio: 'UI/UX Designer specializing in mobile app design and user research',
      location: { city: 'New York', state: 'NY', country: 'USA' },
      rating: { average: 4.8, count: 89 },
      skills: [{
        id: '2',
        name: 'UI/UX Design',
        category: { id: 'design', name: 'Design', icon: '🎨', color: 'bg-purple-100 text-purple-800' },
        level: 'Advanced',
        description: 'User-centered design for web and mobile applications',
        tags: ['Figma', 'Sketch', 'User Research', 'Prototyping'],
        price: 60,
        duration: 90,
        sessionType: ['Private', 'Ongoing']
      }],
      availability: { isAvailable: true, nextAvailable: 'Tomorrow' },
      pricing: { hourlyRate: 60, currency: 'USD' },
      experience: { sessionsCompleted: 156, yearsExperience: 4 },
      verified: true,
      responseTime: 'Usually responds within 3 hours'
    }
  ];

  return {
    providers: mockProviders,
    totalCount: mockProviders.length,
    currentPage: page,
    totalPages: 1,
    hasMore: false
  };
};

export default {
  searchSkillProviders,
  getSkillCategories,
  getMockSearchResults,
};
