"""
Django management command to create or update the permanent admin user
This ensures the admin account is always available with consistent credentials
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction


class Command(BaseCommand):
    help = 'Create or update the permanent admin superuser account'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='kowsalyajikkigari05@gmail.com',
            help='Admin email address (default: kowsalyajikkigari05@gmail.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='Devi@4321',
            help='Admin password (default: Devi@4321)'
        )
        parser.add_argument(
            '--first-name',
            type=str,
            default='Kowsalya',
            help='Admin first name (default: Kowsalya)'
        )
        parser.add_argument(
            '--last-name',
            type=str,
            default='Jikkigari',
            help='Admin last name (default: Jikkigari)'
        )

    def handle(self, *args, **options):
        User = get_user_model()
        
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        
        try:
            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'is_staff': True,
                        'is_superuser': True,
                        'is_active': True,
                    }
                )
                
                # Always update the password and permissions
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.first_name = first_name
                user.last_name = last_name
                user.save()
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✅ Superuser created successfully: {email}'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✅ Superuser updated successfully: {email}'
                        )
                    )
                
                self.stdout.write(
                    self.style.WARNING(
                        f'🔐 Admin Credentials:'
                    )
                )
                self.stdout.write(f'   Email: {email}')
                self.stdout.write(f'   Password: {password}')
                self.stdout.write(f'   URL: http://localhost:8000/admin/')

                # Also populate skill categories
                from django.core.management import call_command
                self.stdout.write('\n🔧 Setting up skill categories...')
                call_command('populate_categories')

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f'❌ Error creating/updating superuser: {str(e)}'
                )
            )
            raise
