#!/usr/bin/env python
"""
Automated admin setup script for SkillSwap
This script ensures the admin user is always created with consistent credentials
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_admin():
    """Set up the admin user automatically"""
    
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap.settings')
    django.setup()
    
    from django.contrib.auth import get_user_model
    from django.db import transaction
    
    User = get_user_model()
    
    # Admin credentials
    admin_email = 'kowsalyajikkigari05@gmail.com'
    admin_password = 'Devi@4321'
    admin_first_name = 'Kowsalya'
    admin_last_name = 'Jikkigari'
    
    try:
        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=admin_email,
                defaults={
                    'first_name': admin_first_name,
                    'last_name': admin_last_name,
                    'is_staff': True,
                    'is_superuser': True,
                    'is_active': True,
                }
            )
            
            # Always update the password and permissions
            user.set_password(admin_password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.first_name = admin_first_name
            user.last_name = admin_last_name
            user.save()
            
            if created:
                print(f'✅ Superuser created successfully: {admin_email}')
            else:
                print(f'✅ Superuser updated successfully: {admin_email}')
            
            print('🔐 Admin Credentials:')
            print(f'   Email: {admin_email}')
            print(f'   Password: {admin_password}')
            print(f'   URL: http://localhost:8000/admin/')
            
            return True
            
    except Exception as e:
        print(f'❌ Error creating/updating superuser: {str(e)}')
        return False

if __name__ == '__main__':
    success = setup_admin()
    sys.exit(0 if success else 1)
