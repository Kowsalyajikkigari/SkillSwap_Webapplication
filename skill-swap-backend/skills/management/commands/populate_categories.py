"""
Django management command to populate initial skill categories
This ensures the database has the required categories for the frontend
"""

from django.core.management.base import BaseCommand
from skills.models import SkillCategory


class Command(BaseCommand):
    help = 'Populate initial skill categories'

    def handle(self, *args, **options):
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
        updated_count = 0
        
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
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created category: {name}')
                )
            else:
                # Update existing category
                category.description = description
                category.icon = icon
                category.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'🔄 Updated category: {name}')
                )
        
        total_categories = SkillCategory.objects.count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Categories setup complete!'
            )
        )
        self.stdout.write(f'   Created: {created_count} new categories')
        self.stdout.write(f'   Updated: {updated_count} existing categories')
        self.stdout.write(f'   Total: {total_categories} categories in database')
        
        # List all categories
        self.stdout.write('\n📋 Available categories:')
        for i, category in enumerate(SkillCategory.objects.all(), 1):
            self.stdout.write(f'   {i}. {category.icon} {category.name} - {category.description}')
