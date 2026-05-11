from django.contrib import admin
from .models import SkillCategory, Skill, UserSkill, UserLearningSkill


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    """Admin for skill categories."""
    
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Admin for skills."""
    
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('name', 'description')


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    """Admin for user skills."""
    
    list_display = ('user', 'skill', 'level', 'years_experience', 'created_at')
    list_filter = ('level', 'skill__category')
    search_fields = ('user__email', 'skill__name', 'description')


@admin.register(UserLearningSkill)
class UserLearningSkillAdmin(admin.ModelAdmin):
    """Admin for user learning skills."""
    
    list_display = ('user', 'skill', 'current_level', 'created_at')
    list_filter = ('current_level', 'skill__category')
    search_fields = ('user__email', 'skill__name', 'goal')
