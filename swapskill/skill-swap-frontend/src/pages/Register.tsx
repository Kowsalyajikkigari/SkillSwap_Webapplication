import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/auth.service';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Enhanced validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      setIsLoading(false);
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Use the auth service to register
      const response = await register({
        firstName,
        lastName,
        email,
        password,
        confirmPassword
      });

      // Registration successful - show success message and redirect to login
      // User must login separately to get authentication tokens
      alert(response.message || 'Account created successfully! Please log in to continue.');
      navigate('/login', {
        state: {
          email: email, // Pre-fill email on login page
          message: 'Registration successful! Please log in with your new account.'
        }
      });
    } catch (err: any) {
      // Enhanced error handling for better user feedback
      console.error('Registration error details:', err);

      let errorMessage = 'Registration failed. Please try again.';

      // Handle different types of errors
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        console.error('Server error response:', errorData);

        // Handle Django REST framework error format
        if (errorData.email && Array.isArray(errorData.email)) {
          errorMessage = `Email error: ${errorData.email[0]}`;
        } else if (errorData.password && Array.isArray(errorData.password)) {
          errorMessage = `Password error: ${errorData.password[0]}`;
        } else if (errorData.password2 && Array.isArray(errorData.password2)) {
          errorMessage = `Password confirmation error: ${errorData.password2[0]}`;
        } else if (errorData.first_name && Array.isArray(errorData.first_name)) {
          errorMessage = `First name error: ${errorData.first_name[0]}`;
        } else if (errorData.last_name && Array.isArray(errorData.last_name)) {
          errorMessage = `Last name error: ${errorData.last_name[0]}`;
        } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          errorMessage = errorData.non_field_errors[0];
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
          maxWidth: '500px'
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Create your SkillSwap account</h1>

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
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="firstName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #D1D5DB',
                    outline: 'none'
                  }}
                  placeholder="John"
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label htmlFor="lastName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #D1D5DB',
                    outline: 'none'
                  }}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  outline: 'none'
                }}
                placeholder="john.doe@example.com"
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
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  outline: 'none'
                }}
                placeholder="Create a strong password"
                required
                minLength={8}
              />
              <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                Password must be at least 8 characters long and not too common
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #D1D5DB',
                  outline: 'none'
                }}
                placeholder="Confirm your password"
                required
              />
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
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>



          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#4F46E5', textDecoration: 'none' }}>
                Log in
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
