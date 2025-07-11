import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService, { EventData, PageViewData } from '../services/analytics.service';
import { useAuth } from './AuthContext';

// Define the shape of the context
interface AnalyticsContextType {
  trackEvent: (data: EventData) => void;
  trackPageView: (data: PageViewData) => void;
  trackFeatureUsage: (feature: string, action: string, properties?: Record<string, any>) => void;
  trackFormSubmission: (formName: string, success: boolean, properties?: Record<string, any>) => void;
  trackError: (errorType: string, errorMessage: string, properties?: Record<string, any>) => void;
}

// Create the context with a default value
const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  trackPageView: () => {},
  trackFeatureUsage: () => {},
  trackFormSubmission: () => {},
  trackError: () => {},
});

// Custom hook to use the analytics context
export const useAnalytics = () => useContext(AnalyticsContext);

// Provider component
interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Initialize analytics service
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    analyticsService.init(user?.id, isDevelopment);
  }, []);

  // Update user ID when auth state changes
  useEffect(() => {
    if (user?.id) {
      analyticsService.setUserId(user.id);
    } else {
      analyticsService.clearUserId();
    }
  }, [user]);

  // Track page views when location changes
  useEffect(() => {
    analyticsService.trackPageView({
      path: location.pathname,
      title: document.title,
    });
  }, [location]);

  // Context value
  const value = {
    trackEvent: analyticsService.trackEvent.bind(analyticsService),
    trackPageView: analyticsService.trackPageView.bind(analyticsService),
    trackFeatureUsage: analyticsService.trackFeatureUsage.bind(analyticsService),
    trackFormSubmission: analyticsService.trackFormSubmission.bind(analyticsService),
    trackError: analyticsService.trackError.bind(analyticsService),
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export default AnalyticsContext;
