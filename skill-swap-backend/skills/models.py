from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class SkillCategory(models.Model):
    """Model for skill categories."""
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # CSS class or icon name
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Skill Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Skill(models.Model):
    """Model for skills."""
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UserSkill(models.Model):
    """Model for user skills (skills that users can teach)."""
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teaching_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='teachers')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='intermediate')
    description = models.TextField(blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'skill']
        ordering = ['-level', 'skill__name']
    
    def __str__(self):
        return f"{self.user.email} - {self.skill.name} ({self.level})"


class UserLearningSkill(models.Model):
    """Model for skills that users want to learn."""
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='learners')
    current_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    goal = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'skill']
        ordering = ['skill__name']
    
    def __str__(self):
        return f"{self.user.email} wants to learn {self.skill.name}"
