import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login, isLoading } = useAuth();

  // Handle state from registration redirect
  useEffect(() => {
    if (location.state) {
      const { email: registeredEmail, message } = location.state as any;
      if (registeredEmail) {
        setEmail(registeredEmail);
      }
      if (message) {
        setSuccessMessage(message);
      }
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Use the AuthContext login function (it handles navigation automatically)
      await login({
        email,
        password,
        rememberMe
      });

      console.log('✅ Login successful, AuthContext will handle navigation');
    } catch (err: any) {
      // Enhanced error handling with specific messages
      console.error('❌ Login error details:', err);

      let errorMessage = 'Login failed. Please try again.';

      // Handle different types of errors
      if (err.response && err.response.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.response && err.response.status === 400) {
        if (err.response.data && err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (err.response.data && err.response.data.email) {
          errorMessage = `Email error: ${err.response.data.email[0]}`;
        } else if (err.response.data && err.response.data.password) {
          errorMessage = `Password error: ${err.response.data.password[0]}`;
        } else {
          errorMessage = 'Please check your input and try again.';
        }
      } else if (err.name === 'ConnectionError') {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running and try again.';
      } else if (err.name === 'NetworkError') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };



  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0'
    }}>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Log in to SkillSwap</h1>

          {successMessage && (
            <div style={{
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  outline: 'none'
                }}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  outline: 'none'
                }}
                placeholder="Enter your password"
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: '#4F46E5',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>



          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p>
              Don't have an account?{' '}
              <a href="/register" style={{ color: '#4F46E5', textDecoration: 'none' }}>
                Sign up
              </a>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              <a href="/forgot-password" style={{ color: '#4F46E5', textDecoration: 'none' }}>
                Forgot your password?
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
