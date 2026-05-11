from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import SkillCategory, Skill, UserSkill, UserLearningSkill

User = get_user_model()


class SkillModelTest(TestCase):
    """Test cases for Skill models."""
    
    def setUp(self):
        self.category = SkillCategory.objects.create(
            name='Programming',
            description='Programming and software development skills'
        )
        self.skill = Skill.objects.create(
            name='Python',
            description='Python programming language',
            category=self.category
        )
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123'
        )
    
    def test_skill_category_creation(self):
        """Test creating a skill category."""
        self.assertEqual(self.category.name, 'Programming')
        self.assertEqual(str(self.category), 'Programming')
    
    def test_skill_creation(self):
        """Test creating a skill."""
        self.assertEqual(self.skill.name, 'Python')
        self.assertEqual(self.skill.category, self.category)
        self.assertEqual(str(self.skill), 'Python')
    
    def test_user_skill_creation(self):
        """Test creating a user teaching skill."""
        user_skill = UserSkill.objects.create(
            user=self.user,
            skill=self.skill,
            level='intermediate',
            years_experience=2
        )
        self.assertEqual(user_skill.user, self.user)
        self.assertEqual(user_skill.skill, self.skill)
        self.assertEqual(user_skill.level, 'intermediate')
    
    def test_user_learning_skill_creation(self):
        """Test creating a user learning skill."""
        learning_skill = UserLearningSkill.objects.create(
            user=self.user,
            skill=self.skill,
            current_level='beginner',
            goal='Learn Python for web development'
        )
        self.assertEqual(learning_skill.user, self.user)
        self.assertEqual(learning_skill.skill, self.skill)
        self.assertEqual(learning_skill.current_level, 'beginner')


class SkillAPITest(APITestCase):
    """Test cases for Skills API endpoints."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            password='testpass123'
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)
        
        self.category = SkillCategory.objects.create(
            name='Programming',
            description='Programming skills'
        )
        self.skill = Skill.objects.create(
            name='Python',
            description='Python programming',
            category=self.category
        )
    
    def test_get_skill_categories(self):
        """Test getting skill categories."""
        url = reverse('skillcategory-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Handle paginated response
        if isinstance(response.data, dict) and 'results' in response.data:
            categories = response.data['results']
        else:
            categories = response.data

        self.assertGreaterEqual(len(categories), 1)
        # Check that our test category exists
        category_names = [cat['name'] for cat in categories]
        self.assertIn('Programming', category_names)
    
    def test_get_skills(self):
        """Test getting skills."""
        url = reverse('skill-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        # Check that our test skill exists
        skill_names = [skill['name'] for skill in response.data]
        self.assertIn('Python', skill_names)
    
    def test_create_user_teaching_skill(self):
        """Test creating a user teaching skill."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        url = reverse('teaching-list')
        data = {
            'skill': self.skill.id,
            'level': 'intermediate',
            'years_experience': 2,
            'description': 'I can teach Python basics'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserSkill.objects.filter(user=self.user, skill=self.skill).exists())
    
    def test_create_user_learning_skill(self):
        """Test creating a user learning skill."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        url = reverse('learning-list')
        data = {
            'skill': self.skill.id,
            'current_level': 'beginner',
            'goal': 'Learn Python for web development'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserLearningSkill.objects.filter(user=self.user, skill=self.skill).exists())
    
    def test_unauthorized_skill_creation(self):
        """Test creating skills without authentication."""
        url = reverse('teaching-list')
        data = {
            'skill': self.skill.id,
            'level': 'intermediate'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
