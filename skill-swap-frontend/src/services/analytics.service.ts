/**
 * Analytics Service
 * 
 * This service handles tracking user behavior and sending analytics data
 * to the backend API and/or third-party analytics services.
 */

import { ANALYTICS_ENDPOINTS } from '../config/api.config';
import api from './api.service';

// Types
export interface EventData {
  eventName: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export interface PageViewData {
  path: string;
  title: string;
  referrer?: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private debugMode = false;

  /**
   * Initialize analytics service
   * @param userId - User ID for authenticated users
   * @param debug - Enable debug mode
   */
  public init(userId?: string, debug = false): void {
    this.isInitialized = true;
    this.userId = userId || null;
    this.debugMode = debug;
    this.sessionId = this.generateSessionId();

    // Track initial page view
    this.trackPageView({
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });

    // Set up navigation tracking
    this.setupNavigationTracking();

    if (this.debugMode) {
      console.log('Analytics initialized', {
        userId: this.userId,
        sessionId: this.sessionId,
      });
    }
  }

  /**
   * Set user ID for authenticated users
   * @param userId - User ID
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    
    if (this.debugMode) {
      console.log('Analytics user ID set', { userId });
    }
  }

  /**
   * Clear user ID (for logout)
   */
  public clearUserId(): void {
    this.userId = null;
    
    if (this.debugMode) {
      console.log('Analytics user ID cleared');
    }
  }

  /**
   * Track custom event
   * @param data - Event data
   */
  public trackEvent(data: EventData): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    const eventData = {
      ...data,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    if (this.debugMode) {
      console.log('Analytics event tracked', eventData);
    }

    // Send to backend API
    api.post(ANALYTICS_ENDPOINTS.TRACK_EVENT, eventData).catch(error => {
      console.error('Error tracking event:', error);
    });

    // If using third-party analytics (like Google Analytics), send there too
    this.sendToThirdParty('event', eventData);
  }

  /**
   * Track page view
   * @param data - Page view data
   */
  public trackPageView(data: PageViewData): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized');
      return;
    }

    const pageViewData = {
      ...data,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    if (this.debugMode) {
      console.log('Analytics page view tracked', pageViewData);
    }

    // Send to backend API
    api.post(ANALYTICS_ENDPOINTS.TRACK_PAGE_VIEW, pageViewData).catch(error => {
      console.error('Error tracking page view:', error);
    });

    // If using third-party analytics (like Google Analytics), send there too
    this.sendToThirdParty('pageview', pageViewData);
  }

  /**
   * Track user interaction with a specific feature
   * @param feature - Feature name
   * @param action - Action performed
   * @param properties - Additional properties
   */
  public trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>): void {
    this.trackEvent({
      eventName: action,
      category: feature,
      properties,
    });
  }

  /**
   * Track form submission
   * @param formName - Form name
   * @param success - Whether submission was successful
   * @param properties - Additional properties
   */
  public trackFormSubmission(formName: string, success: boolean, properties?: Record<string, any>): void {
    this.trackEvent({
      eventName: success ? 'form_submission_success' : 'form_submission_failure',
      category: 'form',
      label: formName,
      properties,
    });
  }

  /**
   * Track error
   * @param errorType - Error type
   * @param errorMessage - Error message
   * @param properties - Additional properties
   */
  public trackError(errorType: string, errorMessage: string, properties?: Record<string, any>): void {
    this.trackEvent({
      eventName: 'error',
      category: errorType,
      label: errorMessage,
      properties,
    });
  }

  /**
   * Generate unique session ID
   * @returns Session ID
   */
  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Set up navigation tracking
   */
  private setupNavigationTracking(): void {
    // Track navigation changes for single-page applications
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleRouteChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleRouteChange();
    };

    window.addEventListener('popstate', this.handleRouteChange.bind(this));
  }

  /**
   * Handle route change
   */
  private handleRouteChange(): void {
    this.trackPageView({
      path: window.location.pathname,
      title: document.title,
    });
  }

  /**
   * Send data to third-party analytics service
   * @param type - Event type
   * @param data - Event data
   */
  private sendToThirdParty(type: 'event' | 'pageview', data: any): void {
    // Implement integration with third-party analytics services here
    // Example for Google Analytics:
    if (window.gtag) {
      if (type === 'event') {
        window.gtag('event', data.eventName, {
          event_category: data.category,
          event_label: data.label,
          value: data.value,
          ...data.properties,
        });
      } else if (type === 'pageview') {
        window.gtag('config', 'YOUR-GA-ID', {
          page_path: data.path,
          page_title: data.title,
          ...data.properties,
        });
      }
    }
  }
}

// Add gtag to window type
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
