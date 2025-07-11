# SkillSwap Backend

This is the Django backend for the SkillSwap application, a platform for users to exchange skills.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Run the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get tokens
- `POST /api/auth/token/refresh/` - Refresh access token
- `POST /api/auth/logout/` - Logout and blacklist refresh token

### User

- `GET /api/auth/user/` - Get current user details
- `PUT /api/auth/user/` - Update current user details
- `GET /api/auth/user/profile/` - Get current user profile
- `PUT /api/auth/user/profile/` - Update current user profile

## Frontend Integration

To connect the React frontend to this Django backend:

1. Make sure the Django server is running on port 8000
2. Update the API_BASE_URL in the frontend to point to `http://localhost:8000/api`
3. Ensure CORS is properly configured in Django settings

## Development

- Run tests: `python manage.py test`
- Check code style: `flake8`
