from django.core.management.base import BaseCommand
from skills.models import SkillCategory, Skill


class Command(BaseCommand):
    help = 'Create default skill categories and skills for the SkillSwap platform'

    def handle(self, *args, **options):
        self.stdout.write('Creating default skill categories and skills...')

        # Create skill categories
        categories_data = [
            {
                'name': 'Programming',
                'description': 'Software development and programming languages',
                'icon': 'code'
            },
            {
                'name': 'Design',
                'description': 'Graphic design, UI/UX, and creative skills',
                'icon': 'palette'
            },
            {
                'name': 'Languages',
                'description': 'Foreign languages and communication',
                'icon': 'globe'
            },
            {
                'name': 'Music',
                'description': 'Musical instruments and music theory',
                'icon': 'music'
            },
            {
                'name': 'Business',
                'description': 'Business skills and entrepreneurship',
                'icon': 'briefcase'
            },
            {
                'name': 'Arts & Crafts',
                'description': 'Creative arts and handmade crafts',
                'icon': 'brush'
            },
            {
                'name': 'Sports & Fitness',
                'description': 'Physical activities and fitness',
                'icon': 'dumbbell'
            },
            {
                'name': 'Cooking',
                'description': 'Culinary arts and cooking techniques',
                'icon': 'chef-hat'
            }
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = SkillCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'description': cat_data['description'],
                    'icon': cat_data['icon']
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'✅ Created category: {category.name}')
            else:
                self.stdout.write(f'📋 Category already exists: {category.name}')

        # Create skills
        skills_data = [
            # Programming
            {'name': 'Python Programming', 'category': 'Programming', 'description': 'Python programming language and frameworks'},
            {'name': 'JavaScript', 'category': 'Programming', 'description': 'JavaScript programming for web development'},
            {'name': 'React', 'category': 'Programming', 'description': 'React.js library for building user interfaces'},
            {'name': 'Django', 'category': 'Programming', 'description': 'Django web framework for Python'},
            {'name': 'Node.js', 'category': 'Programming', 'description': 'Server-side JavaScript runtime'},
            {'name': 'HTML/CSS', 'category': 'Programming', 'description': 'Web markup and styling languages'},
            {'name': 'SQL', 'category': 'Programming', 'description': 'Database query language'},
            {'name': 'Git', 'category': 'Programming', 'description': 'Version control system'},

            # Design
            {'name': 'Photoshop', 'category': 'Design', 'description': 'Adobe Photoshop for image editing'},
            {'name': 'Illustrator', 'category': 'Design', 'description': 'Adobe Illustrator for vector graphics'},
            {'name': 'Figma', 'category': 'Design', 'description': 'UI/UX design and prototyping tool'},
            {'name': 'UI/UX Design', 'category': 'Design', 'description': 'User interface and experience design'},
            {'name': 'Logo Design', 'category': 'Design', 'description': 'Creating brand logos and identity'},

            # Languages
            {'name': 'Spanish', 'category': 'Languages', 'description': 'Spanish language conversation and grammar'},
            {'name': 'French', 'category': 'Languages', 'description': 'French language conversation and grammar'},
            {'name': 'German', 'category': 'Languages', 'description': 'German language conversation and grammar'},
            {'name': 'Mandarin Chinese', 'category': 'Languages', 'description': 'Mandarin Chinese language and culture'},
            {'name': 'Japanese', 'category': 'Languages', 'description': 'Japanese language and culture'},

            # Music
            {'name': 'Guitar', 'category': 'Music', 'description': 'Acoustic and electric guitar playing'},
            {'name': 'Piano', 'category': 'Music', 'description': 'Piano playing and music theory'},
            {'name': 'Violin', 'category': 'Music', 'description': 'Violin playing and classical music'},
            {'name': 'Drums', 'category': 'Music', 'description': 'Drum kit and percussion instruments'},
            {'name': 'Singing', 'category': 'Music', 'description': 'Vocal techniques and performance'},

            # Business
            {'name': 'Digital Marketing', 'category': 'Business', 'description': 'Online marketing strategies and tools'},
            {'name': 'Project Management', 'category': 'Business', 'description': 'Managing projects and teams effectively'},
            {'name': 'Public Speaking', 'category': 'Business', 'description': 'Presentation and communication skills'},
            {'name': 'Excel', 'category': 'Business', 'description': 'Microsoft Excel for data analysis'},
            {'name': 'Entrepreneurship', 'category': 'Business', 'description': 'Starting and running a business'},

            # Arts & Crafts
            {'name': 'Drawing', 'category': 'Arts & Crafts', 'description': 'Pencil and charcoal drawing techniques'},
            {'name': 'Painting', 'category': 'Arts & Crafts', 'description': 'Watercolor, acrylic, and oil painting'},
            {'name': 'Knitting', 'category': 'Arts & Crafts', 'description': 'Knitting patterns and techniques'},
            {'name': 'Photography', 'category': 'Arts & Crafts', 'description': 'Digital photography and editing'},
            {'name': 'Pottery', 'category': 'Arts & Crafts', 'description': 'Ceramic pottery and sculpting'},

            # Sports & Fitness
            {'name': 'Yoga', 'category': 'Sports & Fitness', 'description': 'Yoga poses and meditation'},
            {'name': 'Running', 'category': 'Sports & Fitness', 'description': 'Running techniques and training'},
            {'name': 'Swimming', 'category': 'Sports & Fitness', 'description': 'Swimming strokes and water safety'},
            {'name': 'Tennis', 'category': 'Sports & Fitness', 'description': 'Tennis techniques and strategy'},
            {'name': 'Weight Training', 'category': 'Sports & Fitness', 'description': 'Strength training and fitness'},

            # Cooking
            {'name': 'Italian Cooking', 'category': 'Cooking', 'description': 'Traditional Italian recipes and techniques'},
            {'name': 'Baking', 'category': 'Cooking', 'description': 'Bread, pastries, and dessert baking'},
            {'name': 'Vegetarian Cooking', 'category': 'Cooking', 'description': 'Plant-based recipes and nutrition'},
            {'name': 'BBQ & Grilling', 'category': 'Cooking', 'description': 'Barbecue techniques and recipes'},
            {'name': 'Asian Cuisine', 'category': 'Cooking', 'description': 'Asian cooking styles and ingredients'},
        ]

        skills_created = 0
        skills_existing = 0

        for skill_data in skills_data:
            category = categories[skill_data['category']]
            skill, created = Skill.objects.get_or_create(
                name=skill_data['name'],
                category=category,
                defaults={
                    'description': skill_data['description']
                }
            )
            if created:
                skills_created += 1
                self.stdout.write(f'✅ Created skill: {skill.name}')
            else:
                skills_existing += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\n🎉 Default skills setup completed!\n'
                f'📊 Summary:\n'
                f'   - Categories: {len(categories)} total\n'
                f'   - Skills created: {skills_created}\n'
                f'   - Skills already existing: {skills_existing}\n'
                f'   - Total skills: {skills_created + skills_existing}'
            )
        )
