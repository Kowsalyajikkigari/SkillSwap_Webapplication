from rest_framework import serializers
from .models import SkillCategory, Skill, UserSkill, UserLearningSkill


class SkillCategorySerializer(serializers.ModelSerializer):
    """Serializer for skill categories."""
    
    class Meta:
        model = SkillCategory
        fields = '__all__'


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for skills."""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Skill
        fields = '__all__'


class UserSkillSerializer(serializers.ModelSerializer):
    """Serializer for user skills (skills that users can teach)."""
    
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    category_name = serializers.CharField(source='skill.category.name', read_only=True)
    
    class Meta:
        model = UserSkill
        fields = '__all__'
        read_only_fields = ('user',)


class UserLearningSkillSerializer(serializers.ModelSerializer):
    """Serializer for skills that users want to learn."""
    
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    category_name = serializers.CharField(source='skill.category.name', read_only=True)
    
    class Meta:
        model = UserLearningSkill
        fields = '__all__'
        read_only_fields = ('user',)


class UserSkillDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for user skills with skill information."""
    
    skill = SkillSerializer(read_only=True)
    
    class Meta:
        model = UserSkill
        fields = '__all__'
        read_only_fields = ('user',)


class UserLearningSkillDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for user learning skills with skill information."""
    
    skill = SkillSerializer(read_only=True)
    
    class Meta:
        model = UserLearningSkill
        fields = '__all__'
        read_only_fields = ('user',)
