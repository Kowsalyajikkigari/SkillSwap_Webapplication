"""
Enhanced Skill Matching Algorithm for SwapSkill
Provides intelligent matching between users based on skills, preferences, and compatibility
"""

from django.db.models import Q, Count, Avg, F
from django.contrib.auth import get_user_model
from skills.models import UserSkill, UserLearningSkill, Skill, SkillCategory
from users.models import Profile
import math
from typing import List, Dict, Tuple, Optional

User = get_user_model()


class SkillMatchingEngine:
    """Advanced skill matching engine for finding compatible users"""
    
    def __init__(self):
        self.weights = {
            'skill_overlap': 0.4,      # How many skills match
            'level_compatibility': 0.25, # Teaching level vs learning level
            'location_proximity': 0.15,   # Geographic proximity
            'rating_quality': 0.1,       # User ratings
            'activity_level': 0.1        # Recent activity and engagement
        }
    
    def find_teachers_for_user(self, user: User, limit: int = 20) -> List[Dict]:
        """Find the best teachers for a user's learning goals"""
        user_learning_skills = UserLearningSkill.objects.filter(user=user).select_related('skill')
        
        if not user_learning_skills.exists():
            return []
        
        # Get all users who teach the skills this user wants to learn
        learning_skill_ids = [ls.skill.id for ls in user_learning_skills]
        
        potential_teachers = UserSkill.objects.filter(
            skill_id__in=learning_skill_ids
        ).exclude(
            user=user  # Exclude self
        ).select_related('user', 'skill', 'user__profile').distinct()
        
        matches = []
        for teacher_skill in potential_teachers:
            teacher = teacher_skill.user
            
            # Calculate match score
            score = self._calculate_teacher_match_score(user, teacher, user_learning_skills)
            
            if score > 0.3:  # Minimum threshold
                match_data = {
                    'id': teacher.id,
                    'name': f"{teacher.first_name} {teacher.last_name}",
                    'email': teacher.email,
                    'avatar': teacher.profile.avatar.url if teacher.profile.avatar else None,
                    'bio': teacher.profile.bio or '',
                    'location': teacher.profile.location or '',
                    'rating': float(teacher.profile.average_rating),
                    'sessions_completed': teacher.profile.sessions_completed,
                    'match_percentage': int(score * 100),
                    'matching_skills': self._get_matching_skills(user_learning_skills, teacher),
                    'teacher_level': teacher_skill.level,
                    'years_experience': teacher_skill.years_experience,
                }
                matches.append(match_data)
        
        # Sort by match score and return top matches
        matches.sort(key=lambda x: x['match_percentage'], reverse=True)
        return matches[:limit]
    
    def find_students_for_user(self, user: User, limit: int = 20) -> List[Dict]:
        """Find the best students for a user's teaching skills"""
        user_teaching_skills = UserSkill.objects.filter(user=user).select_related('skill')
        
        if not user_teaching_skills.exists():
            return []
        
        # Get all users who want to learn the skills this user teaches
        teaching_skill_ids = [ts.skill.id for ts in user_teaching_skills]
        
        potential_students = UserLearningSkill.objects.filter(
            skill_id__in=teaching_skill_ids
        ).exclude(
            user=user  # Exclude self
        ).select_related('user', 'skill', 'user__profile').distinct()
        
        matches = []
        for student_skill in potential_students:
            student = student_skill.user
            
            # Calculate match score
            score = self._calculate_student_match_score(user, student, user_teaching_skills)
            
            if score > 0.3:  # Minimum threshold
                match_data = {
                    'id': student.id,
                    'name': f"{student.first_name} {student.last_name}",
                    'email': student.email,
                    'avatar': student.profile.avatar.url if student.profile.avatar else None,
                    'bio': student.profile.bio or '',
                    'location': student.profile.location or '',
                    'rating': float(student.profile.average_rating),
                    'sessions_completed': student.profile.sessions_completed,
                    'match_percentage': int(score * 100),
                    'matching_skills': self._get_matching_learning_skills(user_teaching_skills, student),
                    'student_level': student_skill.current_level,
                    'learning_goal': student_skill.goal,
                }
                matches.append(match_data)
        
        # Sort by match score and return top matches
        matches.sort(key=lambda x: x['match_percentage'], reverse=True)
        return matches[:limit]
    
    def _calculate_teacher_match_score(self, learner: User, teacher: User, learning_skills) -> float:
        """Calculate compatibility score between learner and teacher"""
        score = 0.0
        
        # 1. Skill overlap score
        skill_overlap = self._calculate_skill_overlap_score(learning_skills, teacher, 'teaching')
        score += skill_overlap * self.weights['skill_overlap']
        
        # 2. Level compatibility
        level_compat = self._calculate_level_compatibility(learning_skills, teacher, 'teaching')
        score += level_compat * self.weights['level_compatibility']
        
        # 3. Location proximity
        location_score = self._calculate_location_score(learner, teacher)
        score += location_score * self.weights['location_proximity']
        
        # 4. Teacher rating quality
        rating_score = min(float(teacher.profile.average_rating) / 5.0, 1.0)
        score += rating_score * self.weights['rating_quality']
        
        # 5. Activity level
        activity_score = min(teacher.profile.sessions_completed / 10.0, 1.0)
        score += activity_score * self.weights['activity_level']
        
        return min(score, 1.0)
    
    def _calculate_student_match_score(self, teacher: User, student: User, teaching_skills) -> float:
        """Calculate compatibility score between teacher and student"""
        score = 0.0
        
        # 1. Skill overlap score
        skill_overlap = self._calculate_skill_overlap_score(teaching_skills, student, 'learning')
        score += skill_overlap * self.weights['skill_overlap']
        
        # 2. Level compatibility
        level_compat = self._calculate_level_compatibility(teaching_skills, student, 'learning')
        score += level_compat * self.weights['level_compatibility']
        
        # 3. Location proximity
        location_score = self._calculate_location_score(teacher, student)
        score += location_score * self.weights['location_proximity']
        
        # 4. Student engagement (based on profile completion)
        engagement_score = student.profile.get_completion_percentage() / 100.0
        score += engagement_score * self.weights['rating_quality']
        
        # 5. Activity level
        activity_score = min(student.profile.sessions_completed / 5.0, 1.0)
        score += activity_score * self.weights['activity_level']
        
        return min(score, 1.0)
    
    def _calculate_skill_overlap_score(self, user_skills, other_user: User, skill_type: str) -> float:
        """Calculate how many skills overlap between users"""
        user_skill_ids = {skill.skill.id for skill in user_skills}
        
        if skill_type == 'teaching':
            other_skills = UserSkill.objects.filter(user=other_user).values_list('skill_id', flat=True)
        else:
            other_skills = UserLearningSkill.objects.filter(user=other_user).values_list('skill_id', flat=True)
        
        other_skill_ids = set(other_skills)
        
        if not user_skill_ids or not other_skill_ids:
            return 0.0
        
        overlap = len(user_skill_ids.intersection(other_skill_ids))
        total_user_skills = len(user_skill_ids)
        
        return overlap / total_user_skills
    
    def _calculate_level_compatibility(self, user_skills, other_user: User, skill_type: str) -> float:
        """Calculate level compatibility between users"""
        compatibility_scores = []
        
        for user_skill in user_skills:
            if skill_type == 'teaching':
                other_skill = UserSkill.objects.filter(
                    user=other_user, skill=user_skill.skill
                ).first()
                if other_skill:
                    # Teacher should be at higher or equal level
                    teacher_level = self._level_to_number(other_skill.level)
                    learner_level = self._level_to_number(user_skill.current_level)
                    if teacher_level >= learner_level:
                        compatibility_scores.append(1.0)
                    else:
                        compatibility_scores.append(0.5)
            else:
                other_skill = UserLearningSkill.objects.filter(
                    user=other_user, skill=user_skill.skill
                ).first()
                if other_skill:
                    # Similar learning levels are good
                    teacher_level = self._level_to_number(user_skill.level)
                    student_level = self._level_to_number(other_skill.current_level)
                    level_diff = abs(teacher_level - student_level)
                    compatibility_scores.append(max(0.0, 1.0 - (level_diff * 0.3)))
        
        return sum(compatibility_scores) / len(compatibility_scores) if compatibility_scores else 0.0
    
    def _level_to_number(self, level: str) -> int:
        """Convert skill level to number for comparison"""
        level_map = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'expert': 4
        }
        return level_map.get(level, 1)
    
    def _calculate_location_score(self, user1: User, user2: User) -> float:
        """Calculate location compatibility score"""
        loc1 = user1.profile.location
        loc2 = user2.profile.location
        
        if not loc1 or not loc2:
            return 0.5  # Neutral score if location unknown
        
        # Simple string matching - in production, use geocoding
        if loc1.lower() == loc2.lower():
            return 1.0
        elif any(word in loc2.lower() for word in loc1.lower().split()):
            return 0.7
        else:
            return 0.3
    
    def _get_matching_skills(self, learning_skills, teacher: User) -> List[str]:
        """Get list of skills that match between learner and teacher"""
        learning_skill_ids = {ls.skill.id for ls in learning_skills}
        teacher_skills = UserSkill.objects.filter(
            user=teacher, skill_id__in=learning_skill_ids
        ).select_related('skill')
        
        return [ts.skill.name for ts in teacher_skills]
    
    def _get_matching_learning_skills(self, teaching_skills, student: User) -> List[str]:
        """Get list of skills that match between teacher and student"""
        teaching_skill_ids = {ts.skill.id for ts in teaching_skills}
        student_skills = UserLearningSkill.objects.filter(
            user=student, skill_id__in=teaching_skill_ids
        ).select_related('skill')
        
        return [ss.skill.name for ss in student_skills]


# Global instance
skill_matcher = SkillMatchingEngine()
