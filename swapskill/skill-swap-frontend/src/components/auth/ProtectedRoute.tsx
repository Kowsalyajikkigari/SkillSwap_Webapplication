import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

/**
 * Protected Route Component
 * 
 * This component protects routes that require authentication.
 * It redirects unauthenticated users to the login page.
 * It can also check for specific roles if provided.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { setIsLoading, setLoadingMessage } = useLoading();
  const location = useLocation();

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      setLoadingMessage('Verifying access...');
    } else {
      setIsLoading(false);
      setLoadingMessage('');
    }

    return () => {
      setIsLoading(false);
      setLoadingMessage('');
    };
  }, [authLoading, setIsLoading, setLoadingMessage]);

  // If still loading, return null as loading is handled by LoadingProvider
  if (authLoading) {
    return null;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required, check if user has the required role
  if (requiredRole && user) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and has required role, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
