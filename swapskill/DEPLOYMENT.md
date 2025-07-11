# 🚀 Deployment Guide

## Frontend Deployment (Vercel)

1. **Build the frontend**:
   ```bash
   cd skill-swap-frontend
   npm run build
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`

## Backend Deployment (Heroku)

1. **Prepare for deployment**:
   ```bash
   cd skill-swap-backend
   pip freeze > requirements.txt
   ```

2. **Create Procfile**:
   ```
   web: gunicorn skillswap.wsgi
   ```

3. **Deploy to Heroku**:
   ```bash
   heroku create your-app-name
   heroku config:set DEBUG=False
   heroku config:set SECRET_KEY=your-secret-key
   git push heroku main
   ```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-url.herokuapp.com/api
```

### Backend (.env)
```
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-email-password
```
