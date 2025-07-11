import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService, { User, LoginCredentials, RegisterData } from '../services/auth.service';
import { getCurrentUserProfile } from '../services/profiles';
import { getProfileCompletionStatus, shouldRedirectToOnboarding, getNextOnboardingStepUrl } from '../services/profile-completion.service';

// Define the shape of the context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: string, token: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshProfileStatus: () => Promise<any>;
  refreshUserData: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  socialLogin: async () => {},
  updateUser: () => {},
  refreshProfileStatus: async () => null,
  refreshUserData: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    console.log('🔐 Starting login process...');

    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      console.log('✅ Login successful, user set:', response.user.email);

      // Check profile completion status after successful login
      console.log('🔍 Checking profile completion status...');
      try {
        const completionStatus = await getProfileCompletionStatus();
        console.log('📊 Profile completion status received:', completionStatus);

        if (shouldRedirectToOnboarding(completionStatus)) {
          // Profile is incomplete - redirect to onboarding
          const nextStepUrl = getNextOnboardingStepUrl(completionStatus);
          console.log('🔄 Profile incomplete, redirecting to onboarding:', nextStepUrl);
          console.log('📈 Completion percentage:', completionStatus.completion_percentage + '%');
          navigate(nextStepUrl);
        } else {
          // Profile is complete - redirect to dashboard
          console.log('✅ Profile complete, redirecting to dashboard');
          console.log('📈 Completion percentage:', completionStatus.completion_percentage + '%');
          navigate('/dashboard');
        }
      } catch (completionError) {
        console.error('❌ Error checking profile completion:', completionError);
        // If we can't check completion status, default to dashboard
        console.log('⚠️ Defaulting to dashboard due to completion check error');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      // Note: Registration no longer sets user or navigates
      // User must login separately after registration
      throw new Error('Registration successful! Please log in to continue.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Social login function
  const socialLogin = async (provider: string, token: string) => {
    setIsLoading(true);
    try {
      const response = await authService.socialLogin(provider, token);
      setUser(response.user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Refresh profile completion status (useful after profile updates)
  const refreshProfileStatus = async () => {
    if (user) {
      try {
        console.log('🔄 Refreshing profile completion status...');
        const completionStatus = await getProfileCompletionStatus();
        console.log('✅ Profile status refreshed:', completionStatus);
        return completionStatus;
      } catch (error) {
        console.error('❌ Error refreshing profile status:', error);
        return null;
      }
    }
    return null;
  };

  // Refresh user data from backend
  const refreshUserData = async () => {
    try {
      if (user) {
        const profileData = await getCurrentUserProfile();
        const updatedUser = {
          ...user,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          avatar: profileData.avatar,
          bio: profileData.bio,
          location: profileData.location,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    socialLogin,
    updateUser,
    refreshProfileStatus,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
