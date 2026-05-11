from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Profile
from skills.models import Skill, UserSkill, UserLearningSkill, SkillCategory
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users with profiles and skills for development'

    def handle(self, *args, **options):
        # Create test users
        test_users_data = [
            {
                'email': 'alice@example.com',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'bio': 'Full-stack developer with 5+ years of experience in React and Node.js',
                'location': 'San Francisco, CA',
                'teaching_skills': ['JavaScript', 'React', 'Node.js'],
                'learning_skills': ['Python', 'Machine Learning']
            },
            {
                'email': 'bob@example.com',
                'first_name': 'Bob',
                'last_name': 'Smith',
                'bio': 'UI/UX Designer specializing in mobile app design and user research',
                'location': 'New York, NY',
                'teaching_skills': ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
                'learning_skills': ['JavaScript', 'React']
            },
            {
                'email': 'carol@example.com',
                'first_name': 'Carol',
                'last_name': 'Davis',
                'bio': 'Data scientist with expertise in machine learning and Python',
                'location': 'Austin, TX',
                'teaching_skills': ['Python', 'Machine Learning', 'Data Analysis'],
                'learning_skills': ['JavaScript', 'Web Development']
            },
            {
                'email': 'david@example.com',
                'first_name': 'David',
                'last_name': 'Wilson',
                'bio': 'DevOps engineer passionate about cloud infrastructure and automation',
                'location': 'Seattle, WA',
                'teaching_skills': ['AWS', 'Docker', 'Kubernetes'],
                'learning_skills': ['Python', 'Machine Learning']
            },
            {
                'email': 'emma@example.com',
                'first_name': 'Emma',
                'last_name': 'Brown',
                'bio': 'Mobile app developer with expertise in React Native and Flutter',
                'location': 'Los Angeles, CA',
                'teaching_skills': ['React Native', 'Flutter', 'Mobile Development'],
                'learning_skills': ['Backend Development', 'Node.js']
            }
        ]

        created_users = []
        
        for user_data in test_users_data:
            # Check if user already exists
            if User.objects.filter(email=user_data['email']).exists():
                self.stdout.write(
                    self.style.WARNING(f'User {user_data["email"]} already exists, skipping...')
                )
                continue
            
            # Create user
            user = User.objects.create_user(
                email=user_data['email'],
                password='testpass123',  # Simple password for testing
                first_name=user_data['first_name'],
                last_name=user_data['last_name']
            )
            
            # Update profile
            profile = user.profile  # Profile is created automatically via signal
            profile.bio = user_data['bio']
            profile.location = user_data['location']
            profile.save()
            
            # Add teaching skills
            for skill_name in user_data['teaching_skills']:
                try:
                    # Get appropriate category for the skill
                    category = self.get_skill_category(skill_name)
                    skill, created = Skill.objects.get_or_create(
                        name=skill_name,
                        defaults={
                            'description': f'Learn {skill_name}',
                            'category': category
                        }
                    )
                    UserSkill.objects.get_or_create(
                        user=user,
                        skill=skill,
                        defaults={
                            'level': random.choice(['beginner', 'intermediate', 'advanced']),
                            'years_experience': random.randint(1, 10),
                            'description': f'I can teach {skill_name}'
                        }
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f'Error creating teaching skill {skill_name} for {user.email}: {e}')
                    )
            
            # Add learning skills
            for skill_name in user_data['learning_skills']:
                try:
                    # Get appropriate category for the skill
                    category = self.get_skill_category(skill_name)
                    skill, created = Skill.objects.get_or_create(
                        name=skill_name,
                        defaults={
                            'description': f'Learn {skill_name}',
                            'category': category
                        }
                    )
                    UserLearningSkill.objects.get_or_create(
                        user=user,
                        skill=skill,
                        defaults={
                            'current_level': random.choice(['beginner', 'intermediate']),
                            'goal': f'I want to learn {skill_name}'
                        }
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.WARNING(f'Error creating learning skill {skill_name} for {user.email}: {e}')
                    )
            
            created_users.append(user)
            self.stdout.write(
                self.style.SUCCESS(f'Created user: {user.email}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {len(created_users)} test users!')
        )
        
        # Display created users
        for user in created_users:
            self.stdout.write(f'  - {user.first_name} {user.last_name} ({user.email})')
    
    def get_skill_category(self, skill_name):
        """Get appropriate category for a skill."""
        skill_categories = {
            'JavaScript': 'Programming',
            'React': 'Programming', 
            'Node.js': 'Programming',
            'Python': 'Programming',
            'Machine Learning': 'Technology',
            'UI/UX Design': 'Design',
            'Figma': 'Design',
            'Adobe Creative Suite': 'Design',
            'Data Analysis': 'Technology',
            'AWS': 'Technology',
            'Docker': 'Technology',
            'Kubernetes': 'Technology',
            'React Native': 'Programming',
            'Flutter': 'Programming',
            'Mobile Development': 'Programming',
            'Backend Development': 'Programming',
            'Web Development': 'Programming'
        }
        
        category_name = skill_categories.get(skill_name, 'Technology')
        try:
            return SkillCategory.objects.get(name=category_name)
        except SkillCategory.DoesNotExist:
            # Fallback to first available category
            return SkillCategory.objects.first()