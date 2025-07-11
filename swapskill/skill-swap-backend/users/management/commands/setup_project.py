"""
Comprehensive project setup command that handles all initialization
This ensures the project is ready to use with zero manual intervention
"""

import os
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import transaction
from django.conf import settings
from skills.models import SkillCategory


class Command(BaseCommand):
    help = 'Complete project setup - database, admin user, categories, and media directories'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset database before setup (WARNING: This will delete all data)'
        )
        parser.add_argument(
            '--admin-email',
            type=str,
            default='kowsalyajikkigari05@gmail.com',
            help='Admin email address'
        )
        parser.add_argument(
            '--admin-password',
            type=str,
            default='Devi@4321',
            help='Admin password'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🚀 Starting SkillSwap Project Setup...')
        )
        
        try:
            # Step 1: Database reset if requested
            if options['reset']:
                self.stdout.write('⚠️  Resetting database...')
                self.reset_database()
            
            # Step 2: Run migrations
            self.stdout.write('📊 Running database migrations...')
            call_command('migrate', verbosity=0)
            self.stdout.write(self.style.SUCCESS('✅ Database migrations completed'))
            
            # Step 3: Create media directories
            self.stdout.write('📁 Setting up media directories...')
            self.setup_media_directories()
            
            # Step 4: Populate skill categories
            self.stdout.write('📋 Setting up skill categories...')
            self.setup_skill_categories()
            
            # Step 5: Create admin user
            self.stdout.write('👤 Setting up admin user...')
            self.setup_admin_user(options['admin_email'], options['admin_password'])
            
            # Step 6: Verify setup
            self.stdout.write('🔍 Verifying setup...')
            self.verify_setup()
            
            self.stdout.write('\n' + '='*60)
            self.stdout.write(
                self.style.SUCCESS('🎉 SkillSwap Project Setup Complete!')
            )
            self.stdout.write('='*60)
            self.stdout.write('🌐 Backend: http://127.0.0.1:8000/')
            self.stdout.write('🎨 Frontend: http://localhost:3000/')
            self.stdout.write('🔐 Admin Panel: http://127.0.0.1:8000/admin/')
            self.stdout.write(f'📧 Admin Email: {options["admin_email"]}')
            self.stdout.write(f'🔑 Admin Password: {options["admin_password"]}')
            self.stdout.write('='*60)
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Setup failed: {str(e)}')
            )
            raise

    def reset_database(self):
        """Reset the database by deleting and recreating it"""
        db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
        if os.path.exists(db_path):
            os.remove(db_path)
            self.stdout.write('✅ Database file deleted')

    def setup_media_directories(self):
        """Create media directories with proper permissions"""
        media_dirs = [
            settings.MEDIA_ROOT,
            os.path.join(settings.MEDIA_ROOT, 'avatars'),
            os.path.join(settings.MEDIA_ROOT, 'uploads'),
            os.path.join(settings.MEDIA_ROOT, 'temp'),
        ]
        
        for directory in media_dirs:
            os.makedirs(directory, exist_ok=True)
            # Set permissions (readable/writable by owner and group)
            try:
                os.chmod(directory, 0o755)
            except (OSError, AttributeError):
                # Windows doesn't support chmod the same way
                pass
        
        self.stdout.write(self.style.SUCCESS('✅ Media directories created'))

    def setup_skill_categories(self):
        """Populate skill categories"""
        categories = [
            ('Technology', 'Programming, web development, software engineering', '💻'),
            ('Creative', 'Art, design, photography, writing', '🎨'),
            ('Business', 'Marketing, finance, entrepreneurship', '💼'),
            ('Language', 'Foreign languages, communication skills', '🗣️'),
            ('Health & Fitness', 'Exercise, nutrition, wellness', '💪'),
            ('Music', 'Instruments, singing, music production', '🎵'),
            ('Cooking', 'Culinary arts, baking, food preparation', '👨‍🍳'),
            ('Crafts', 'DIY, woodworking, crafting', '🔨'),
            ('Education', 'Teaching, tutoring, academic subjects', '📚'),
            ('Sports', 'Athletic skills, coaching, outdoor activities', '⚽'),
        ]
        
        created_count = 0
        with transaction.atomic():
            for name, description, icon in categories:
                category, created = SkillCategory.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': description,
                        'icon': icon
                    }
                )
                if created:
                    created_count += 1
        
        total_categories = SkillCategory.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Skill categories setup: {created_count} created, {total_categories} total'
            )
        )

    def setup_admin_user(self, email, password):
        """Create or update admin user"""
        User = get_user_model()
        
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': 'Kowsalya',
                    'last_name': 'Jikkigari',
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True,
                }
            )
            
            # Always update password and permissions
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
            
            # Create profile if it doesn't exist
            from users.models import Profile
            profile, profile_created = Profile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': 'SkillSwap Administrator',
                    'location': 'Admin Location',
                }
            )
            
            action = 'created' if created else 'updated'
            self.stdout.write(
                self.style.SUCCESS(f'✅ Admin user {action}: {email}')
            )

    def verify_setup(self):
        """Verify that setup completed successfully"""
        User = get_user_model()

        # Check admin user
        admin_exists = User.objects.filter(is_superuser=True).exists()
        if not admin_exists:
            raise Exception("Admin user not found")

        # Check categories
        category_count = SkillCategory.objects.count()
        if category_count == 0:
            raise Exception("No skill categories found")

        # Check media directories
        if not os.path.exists(settings.MEDIA_ROOT):
            raise Exception("Media directory not created")

        # Test avatar handling
        try:
            user = User.objects.first()
            if user:
                # Test avatar property access (should not raise errors)
                avatar = user.avatar
                avatar_url = user.avatar_url

                # Test serializer
                from users.serializers import UserProfileSerializer
                serializer = UserProfileSerializer(user)
                data = serializer.data  # Should not raise errors

                self.stdout.write('✅ Avatar handling verified')
        except Exception as e:
            raise Exception(f"Avatar handling test failed: {e}")

        self.stdout.write(
            self.style.SUCCESS('✅ Setup verification passed')
        )
