@echo off
echo ========================================
echo    Setting Up SkillSwap Admin User
echo ========================================
echo.

cd /d "%~dp0skill-swap-backend"

echo 🔧 Creating/Updating Admin User...
python manage.py create_admin

echo.
echo ========================================
echo    Admin Setup Complete!
echo ========================================
echo.
echo 🔐 Your Admin Credentials:
echo    Email: kowsalyajikkigari05@gmail.com
echo    Password: Devi@4321
echo    URL: http://localhost:8000/admin/
echo.
echo ✅ You can now log in to Django Admin!
echo.
pause
