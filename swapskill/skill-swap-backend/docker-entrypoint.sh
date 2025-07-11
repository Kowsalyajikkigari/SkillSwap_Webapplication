#!/bin/bash

# Exit on any error
set -e

echo "Starting SwapSkill Backend..."

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database is ready!"

# Wait for Redis to be ready
echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 0.1
done
echo "Redis is ready!"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='kowsalyajikkigari05@gmail.com').exists():
    User.objects.create_superuser(
        email='kowsalyajikkigari05@gmail.com',
        password='Devi@4321',
        first_name='Kowsalya',
        last_name='Jikkigari'
    )
    print('Superuser created successfully')
else:
    print('Superuser already exists')
EOF

# Load initial data if needed
echo "Loading initial data..."
python manage.py shell << EOF
from skills.models import SkillCategory, Skill

# Create skill categories if they don't exist
categories = [
    {'name': 'Programming', 'description': 'Software development and coding skills', 'icon': 'code'},
    {'name': 'Design', 'description': 'Creative and visual design skills', 'icon': 'palette'},
    {'name': 'Languages', 'description': 'Foreign language learning and teaching', 'icon': 'globe'},
    {'name': 'Business', 'description': 'Business and entrepreneurship skills', 'icon': 'briefcase'},
    {'name': 'Creative', 'description': 'Creative arts and crafts', 'icon': 'brush'},
    {'name': 'Music', 'description': 'Musical instruments and theory', 'icon': 'music'},
    {'name': 'Sports', 'description': 'Physical activities and sports', 'icon': 'activity'},
    {'name': 'Cooking', 'description': 'Culinary arts and cooking techniques', 'icon': 'chef-hat'},
]

for cat_data in categories:
    category, created = SkillCategory.objects.get_or_create(
        name=cat_data['name'],
        defaults=cat_data
    )
    if created:
        print(f'Created category: {category.name}')

# Create some sample skills
programming_cat = SkillCategory.objects.get(name='Programming')
design_cat = SkillCategory.objects.get(name='Design')
languages_cat = SkillCategory.objects.get(name='Languages')

skills = [
    {'name': 'Python Programming', 'category': programming_cat, 'description': 'Python programming language'},
    {'name': 'JavaScript', 'category': programming_cat, 'description': 'JavaScript programming language'},
    {'name': 'React', 'category': programming_cat, 'description': 'React frontend framework'},
    {'name': 'Django', 'category': programming_cat, 'description': 'Django web framework'},
    {'name': 'UI/UX Design', 'category': design_cat, 'description': 'User interface and experience design'},
    {'name': 'Graphic Design', 'category': design_cat, 'description': 'Visual design and graphics'},
    {'name': 'Spanish', 'category': languages_cat, 'description': 'Spanish language learning'},
    {'name': 'French', 'category': languages_cat, 'description': 'French language learning'},
]

for skill_data in skills:
    skill, created = Skill.objects.get_or_create(
        name=skill_data['name'],
        category=skill_data['category'],
        defaults={'description': skill_data['description']}
    )
    if created:
        print(f'Created skill: {skill.name}')

print('Initial data loaded successfully')
EOF

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Setup complete! Starting application..."

# Execute the main command
exec "$@"
