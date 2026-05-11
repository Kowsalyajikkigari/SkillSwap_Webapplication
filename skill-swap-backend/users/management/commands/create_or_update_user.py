from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Create or update a user with specified credentials'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='User email address')
        parser.add_argument('--password', type=str, required=True, help='User password')
        parser.add_argument('--first-name', type=str, help='User first name')
        parser.add_argument('--last-name', type=str, help='User last name')
        parser.add_argument('--is-staff', action='store_true', help='Make user staff')
        parser.add_argument('--is-superuser', action='store_true', help='Make user superuser')
        parser.add_argument('--update', action='store_true', help='Update existing user if exists')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options.get('first_name', '')
        last_name = options.get('last_name', '')
        is_staff = options.get('is_staff', False)
        is_superuser = options.get('is_superuser', False)
        update_existing = options.get('update', False)

        try:
            with transaction.atomic():
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'is_staff': is_staff,
                        'is_superuser': is_superuser,
                    }
                )

                if created:
                    user.set_password(password)
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ User created successfully: {email}')
                    )
                    self.stdout.write(f'   Name: {user.first_name} {user.last_name}')
                    self.stdout.write(f'   Staff: {user.is_staff}')
                    self.stdout.write(f'   Superuser: {user.is_superuser}')
                elif update_existing:
                    # Update existing user
                    user.set_password(password)
                    if first_name:
                        user.first_name = first_name
                    if last_name:
                        user.last_name = last_name
                    if is_staff:
                        user.is_staff = is_staff
                    if is_superuser:
                        user.is_superuser = is_superuser
                    user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'✅ User updated successfully: {email}')
                    )
                    self.stdout.write(f'   Name: {user.first_name} {user.last_name}')
                    self.stdout.write(f'   Staff: {user.is_staff}')
                    self.stdout.write(f'   Superuser: {user.is_superuser}')
                else:
                    self.stdout.write(
                        self.style.WARNING(f'⚠️  User already exists: {email}')
                    )
                    self.stdout.write('   Use --update flag to update existing user')
                    return

                # Test password
                if user.check_password(password):
                    self.stdout.write(
                        self.style.SUCCESS('✅ Password verification: PASSED')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR('❌ Password verification: FAILED')
                    )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error: {str(e)}')
            )
