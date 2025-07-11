/**
 * Skills Service
 *
 * This service handles all skill-related API calls including:
 * - Base skills (categories)
 * - Teaching skills (user's skills they can teach)
 * - Learning skills (user's skills they want to learn)
 */

import { get, post, put, del } from './api.service';
import {
  Skill,
  TeachingSkill,
  LearningSkill,
  SkillCategory,
  PaginatedResponse
} from '@/types';
import { SKILL_ENDPOINTS, USE_MOCK_DATA } from '@/config/api.config';

// ============================================================================
// BASE SKILLS (Categories)
// ============================================================================

/**
 * Get all available skills/categories
 */
export const getAllSkills = async (): Promise<Skill[]> => {
  try {
    console.log('📥 Fetching all skills from backend...');
    const response = await get<any>(SKILL_ENDPOINTS.GET_SKILLS);

    console.log('🔍 Raw skills API response:', response);

    // Handle paginated response from /api/skills/all/
    if (response && typeof response === 'object' && Array.isArray(response.results)) {
      console.log(`✅ Found ${response.results.length} skills from backend (total: ${response.count})`);

      // Transform backend skill format to frontend format
      const transformedSkills: Skill[] = response.results.map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category_name || 'General',
        description: skill.description,
        created_at: skill.created_at,
        updated_at: skill.updated_at
      }));

      console.log('🔄 Transformed skills:', transformedSkills);
      return transformedSkills;
    }

    // Handle direct array response (fallback)
    if (Array.isArray(response)) {
      console.log(`✅ Found ${response.length} skills as direct array`);
      return response;
    }

    // If no valid response format, return empty array
    console.error('❌ API returned unexpected format:', response);
    throw new Error('Invalid API response format');

  } catch (error) {
    console.error('❌ Error fetching skills from backend:', error);
    throw error; // Re-throw error instead of falling back to mock data
  }
};

/**
 * Get a specific skill by ID
 */
export const getSkillById = async (skillId: string | number): Promise<Skill> => {
  const mockSkill: Skill = {
    id: Number(skillId),
    name: 'Sample Skill',
    category: 'Sample Category'
  };

  return await get<Skill>(
    SKILL_ENDPOINTS.GET_SKILL(skillId.toString()),
    undefined,
    undefined,
    mockSkill
  );
};

/**
 * Get all skill categories
 */
export const getSkillCategories = async (): Promise<SkillCategory[]> => {
  const mockCategories: SkillCategory[] = [
    { id: 1, name: 'Programming' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Arts' },
    { id: 4, name: 'Languages' },
    { id: 5, name: 'Music' },
    { id: 6, name: 'Fitness' },
    { id: 7, name: 'Culinary' },
    { id: 8, name: 'Business' },
  ];

  return await get<SkillCategory[]>(
    SKILL_ENDPOINTS.GET_CATEGORIES,
    undefined,
    undefined,
    mockCategories
  );
};

// ============================================================================
// TEACHING SKILLS (Skills user can teach)
// ============================================================================

/**
 * Get user's teaching skills
 */
export const getTeachingSkills = async (): Promise<TeachingSkill[]> => {
  const mockTeachingSkills: TeachingSkill[] = [];

  try {
    const response = await get<PaginatedResponse<TeachingSkill>>(
      SKILL_ENDPOINTS.GET_TEACHING_SKILLS,
      undefined,
      undefined,
      { count: 0, next: null, previous: null, results: mockTeachingSkills }
    );
    return response.results;
  } catch (error) {
    console.error('Error fetching teaching skills:', error);
    return mockTeachingSkills;
  }
};

/**
 * Create a new teaching skill
 */
export const createTeachingSkill = async (skillData: {
  skill: number;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
}): Promise<TeachingSkill> => {
  return await post<TeachingSkill>(
    SKILL_ENDPOINTS.CREATE_TEACHING_SKILL,
    skillData
  );
};

/**
 * Update a teaching skill
 */
export const updateTeachingSkill = async (
  skillId: number,
  skillData: Partial<{
    skill: number;
    experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    description: string;
  }>
): Promise<TeachingSkill> => {
  return await put<TeachingSkill>(
    SKILL_ENDPOINTS.UPDATE_TEACHING_SKILL(skillId.toString()),
    skillData
  );
};

/**
 * Delete a teaching skill
 */
export const deleteTeachingSkill = async (skillId: number): Promise<void> => {
  return await del<void>(
    SKILL_ENDPOINTS.DELETE_TEACHING_SKILL(skillId.toString())
  );
};

// ============================================================================
// LEARNING SKILLS (Skills user wants to learn)
// ============================================================================

/**
 * Get user's learning skills
 */
export const getLearningSkills = async (): Promise<LearningSkill[]> => {
  const mockLearningSkills: LearningSkill[] = [];

  try {
    const response = await get<PaginatedResponse<LearningSkill>>(
      SKILL_ENDPOINTS.GET_LEARNING_SKILLS,
      undefined,
      undefined,
      { count: 0, next: null, previous: null, results: mockLearningSkills }
    );
    return response.results;
  } catch (error) {
    console.error('Error fetching learning skills:', error);
    return mockLearningSkills;
  }
};

/**
 * Create a new learning skill
 */
export const createLearningSkill = async (skillData: {
  skill: number;
  current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  goal: string;
}): Promise<LearningSkill> => {
  return await post<LearningSkill>(
    SKILL_ENDPOINTS.CREATE_LEARNING_SKILL,
    skillData
  );
};

/**
 * Update a learning skill
 */
export const updateLearningSkill = async (
  skillId: number,
  skillData: Partial<{
    skill: number;
    current_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    goal: string;
  }>
): Promise<LearningSkill> => {
  return await put<LearningSkill>(
    SKILL_ENDPOINTS.UPDATE_LEARNING_SKILL(skillId.toString()),
    skillData
  );
};

/**
 * Delete a learning skill
 */
export const deleteLearningSkill = async (skillId: number): Promise<void> => {
  return await del<void>(
    SKILL_ENDPOINTS.DELETE_LEARNING_SKILL(skillId.toString())
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Base skills
  getAllSkills,
  getSkillById,
  getSkillCategories,

  // Teaching skills
  getTeachingSkills,
  createTeachingSkill,
  updateTeachingSkill,
  deleteTeachingSkill,

  // Learning skills
  getLearningSkills,
  createLearningSkill,
  updateLearningSkill,
  deleteLearningSkill,
};
