"""
Enhanced skill search views for SwapSkill
Provides advanced search and filtering capabilities for skills and users
"""

from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count, Avg
from django.contrib.auth import get_user_model
from .models import Skill, SkillCategory, UserSkill, UserLearningSkill
from .matching_algorithm import skill_matcher
from users.models import Profile

User = get_user_model()


class AdvancedSkillSearchView(APIView):
    """Advanced skill search with filtering and matching capabilities"""
    
    permission_classes = [permissions.AllowAny]  # Allow public search
    
    def get(self, request):
        """
        Advanced skill search with multiple filters
        
        Query parameters:
        - q: Search query (skill name, description, category)
        - category: Filter by category ID or name
        - level: Filter by skill level (beginner, intermediate, advanced, expert)
        - location: Filter by user location
        - min_rating: Minimum user rating
        - has_availability: Filter users with availability
        - sort_by: Sort results (rating, experience, sessions, match_score)
        - limit: Number of results to return (default: 20)
        """
        try:
            # Get query parameters
            query = request.GET.get('q', '').strip()
            category = request.GET.get('category', '')
            level = request.GET.get('level', '')
            location = request.GET.get('location', '')
            min_rating = request.GET.get('min_rating', 0)
            has_availability = request.GET.get('has_availability', '').lower() == 'true'
            sort_by = request.GET.get('sort_by', 'rating')
            limit = int(request.GET.get('limit', 20))
            
            # Start with all user skills
            user_skills = UserSkill.objects.select_related(
                'user', 'skill', 'skill__category', 'user__profile'
            ).all()
            
            # Apply filters
            if query:
                user_skills = user_skills.filter(
                    Q(skill__name__icontains=query) |
                    Q(skill__description__icontains=query) |
                    Q(skill__category__name__icontains=query) |
                    Q(description__icontains=query)
                )
            
            if category:
                if category.isdigit():
                    user_skills = user_skills.filter(skill__category_id=category)
                else:
                    user_skills = user_skills.filter(skill__category__name__icontains=category)
            
            if level:
                user_skills = user_skills.filter(level=level)
            
            if location:
                user_skills = user_skills.filter(user__profile__location__icontains=location)
            
            if min_rating:
                user_skills = user_skills.filter(user__profile__average_rating__gte=float(min_rating))
            
            # Apply sorting
            if sort_by == 'rating':
                user_skills = user_skills.order_by('-user__profile__average_rating')
            elif sort_by == 'experience':
                user_skills = user_skills.order_by('-years_experience')
            elif sort_by == 'sessions':
                user_skills = user_skills.order_by('-user__profile__sessions_completed')
            else:
                user_skills = user_skills.order_by('-user__profile__average_rating')
            
            # Limit results
            user_skills = user_skills[:limit]
            
            # Format results
            results = []
            for user_skill in user_skills:
                user = user_skill.user
                skill_data = {
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'avatar': user.profile.avatar.url if user.profile.avatar else None,
                    'bio': user.profile.bio or '',
                    'location': user.profile.location or '',
                    'rating': float(user.profile.average_rating),
                    'sessions_completed': user.profile.sessions_completed,
                    'skill': {
                        'id': user_skill.skill.id,
                        'name': user_skill.skill.name,
                        'category': user_skill.skill.category.name,
                        'level': user_skill.level,
                        'years_experience': user_skill.years_experience,
                        'description': user_skill.description or user_skill.skill.description,
                    }
                }
                results.append(skill_data)
            
            return Response({
                'results': results,
                'total_count': len(results),
                'query_params': {
                    'query': query,
                    'category': category,
                    'level': level,
                    'location': location,
                    'min_rating': min_rating,
                    'sort_by': sort_by,
                    'limit': limit
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Search failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PersonalizedSkillRecommendationsView(APIView):
    """Get personalized skill recommendations for authenticated users"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get personalized skill recommendations based on user's profile and activity"""
        try:
            user = request.user
            
            # Get user's current skills
            teaching_skills = UserSkill.objects.filter(user=user).values_list('skill__id', flat=True)
            learning_skills = UserLearningSkill.objects.filter(user=user).values_list('skill__id', flat=True)
            
            # Find complementary skills
            complementary_skills = self._find_complementary_skills(teaching_skills, learning_skills)
            
            # Find trending skills
            trending_skills = self._find_trending_skills()
            
            # Find skills based on location
            location_skills = self._find_location_based_skills(user.profile.location)
            
            return Response({
                'complementary_skills': complementary_skills[:5],
                'trending_skills': trending_skills[:5],
                'location_based_skills': location_skills[:5],
                'recommendation_factors': [
                    'skill_complementarity',
                    'trending_popularity',
                    'location_relevance',
                    'user_activity_patterns'
                ]
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get recommendations: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _find_complementary_skills(self, teaching_skills, learning_skills):
        """Find skills that complement user's existing skills"""
        # Get skills from same categories as user's skills
        user_categories = Skill.objects.filter(
            Q(id__in=teaching_skills) | Q(id__in=learning_skills)
        ).values_list('category_id', flat=True).distinct()
        
        # Find popular skills in those categories that user doesn't have
        complementary = Skill.objects.filter(
            category_id__in=user_categories
        ).exclude(
            Q(id__in=teaching_skills) | Q(id__in=learning_skills)
        ).annotate(
            teacher_count=Count('teachers')
        ).order_by('-teacher_count')[:10]
        
        return [{'id': skill.id, 'name': skill.name, 'category': skill.category.name} 
                for skill in complementary]
    
    def _find_trending_skills(self):
        """Find currently trending skills based on recent activity"""
        # Skills with most new teachers in recent period
        trending = Skill.objects.annotate(
            teacher_count=Count('teachers'),
            learner_count=Count('learners')
        ).order_by('-teacher_count', '-learner_count')[:10]
        
        return [{'id': skill.id, 'name': skill.name, 'category': skill.category.name,
                'teacher_count': skill.teacher_count, 'learner_count': skill.learner_count} 
                for skill in trending]
    
    def _find_location_based_skills(self, user_location):
        """Find skills popular in user's location"""
        if not user_location:
            return []
        
        # Find skills taught by users in same location
        location_skills = Skill.objects.filter(
            teachers__user__profile__location__icontains=user_location
        ).annotate(
            local_teacher_count=Count('teachers')
        ).order_by('-local_teacher_count')[:10]
        
        return [{'id': skill.id, 'name': skill.name, 'category': skill.category.name,
                'local_teachers': skill.local_teacher_count} 
                for skill in location_skills]


class SkillCategoriesView(APIView):
    """Get all skill categories with statistics"""
    
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        """Get all skill categories with skill counts and teacher counts"""
        try:
            categories = SkillCategory.objects.annotate(
                skill_count=Count('skills'),
                teacher_count=Count('skills__teachers'),
                learner_count=Count('skills__learners')
            ).order_by('name')
            
            category_data = []
            for category in categories:
                category_data.append({
                    'id': category.id,
                    'name': category.name,
                    'description': category.description,
                    'icon': category.icon,
                    'skill_count': category.skill_count,
                    'teacher_count': category.teacher_count,
                    'learner_count': category.learner_count,
                })
            
            return Response({
                'categories': category_data,
                'total_categories': len(category_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to get categories: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
