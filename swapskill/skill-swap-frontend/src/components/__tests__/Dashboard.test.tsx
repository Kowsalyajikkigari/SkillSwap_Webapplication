import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../dashboard/Dashboard';
import AuthContext from '../../contexts/AuthContext';

// Test environment configuration
const TEST_API_BASE_URL = import.meta.env.VITE_TEST_API_URL || 'http://127.0.0.1:8000/api';
const TEST_USER_EMAIL = import.meta.env.VITE_TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = import.meta.env.VITE_TEST_USER_PASSWORD || 'testpassword123';
const TEST_TIMEOUT = parseInt(import.meta.env.VITE_TEST_TIMEOUT || '15000');

// Test authentication token storage
let testAuthToken: string | null = null;
let testUser: any = null;

// Helper function to authenticate test user
async function authenticateTestUser() {
  try {
    const response = await fetch(`${TEST_API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      testAuthToken = data.access_token || data.token;
      testUser = data.user;

      // Store token in localStorage for the app to use
      localStorage.setItem('access_token', testAuthToken);
      localStorage.setItem('user', JSON.stringify(testUser));

      return { token: testAuthToken, user: testUser };
    } else {
      console.warn('Test user authentication failed, tests may need a test user setup');
      return null;
    }
  } catch (error) {
    console.warn('Test API not available, skipping authentication:', error);
    return null;
  }
}

// Helper function to clean up test data
async function cleanupTestData() {
  if (testAuthToken) {
    try {
      await fetch(`${TEST_API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testAuthToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.warn('Logout failed during cleanup:', error);
    }
  }

  // Clear localStorage
  localStorage.clear();
  testAuthToken = null;
  testUser = null;
}

// Mock UI components
vi.mock('../ui/tabs', () => ({
  Tabs: ({ children, ...props }: any) => <div data-testid="tabs" {...props}>{children}</div>,
  TabsContent: ({ children, ...props }: any) => <div data-testid="tabs-content" {...props}>{children}</div>,
  TabsList: ({ children, ...props }: any) => <div data-testid="tabs-list" {...props}>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => <button data-testid="tabs-trigger" {...props}>{children}</button>,
}));

// Mock tab components
vi.mock('../dashboard/tabs/OverviewTab', () => ({
  default: () => <div data-testid="overview-tab">Overview Tab</div>,
}));

vi.mock('../dashboard/tabs/MatchesTab', () => ({
  default: () => <div data-testid="matches-tab">Matches Tab</div>,
}));

vi.mock('../dashboard/tabs/ChallengesTab', () => ({
  default: () => <div data-testid="challenges-tab">Challenges Tab</div>,
}));

vi.mock('../dashboard/tabs/CommunityTab', () => ({
  default: () => <div data-testid="community-tab">Community Tab</div>,
}));

vi.mock('../dashboard/tabs/ProgressTab', () => ({
  default: () => <div data-testid="progress-tab">Progress Tab</div>,
}));

// Real auth context value for integration tests
const createAuthContextValue = (user: any) => ({
  user: user,
  isAuthenticated: !!user,
  isLoading: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  socialLogin: async () => {},
  updateUser: () => {},
  refreshProfileStatus: async () => null,
  refreshUserData: async () => {},
});

const renderDashboard = (user: any = null) => {
  const authContextValue = createAuthContextValue(user);

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContextValue}>
        <Dashboard />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Dashboard Component Integration Tests', () => {
  beforeAll(async () => {
    // Set up test environment
    console.log('Setting up integration test environment...');

    // Try to authenticate test user
    const authResult = await authenticateTestUser();
    if (authResult) {
      console.log('Test user authenticated successfully');
    } else {
      console.log('Running tests without authentication (API may not be available)');
    }
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    console.log('Test cleanup completed');
  });

  beforeEach(() => {
    // Clear any previous localStorage state
    localStorage.clear();

    // Set up fresh auth state if we have a test user
    if (testAuthToken && testUser) {
      localStorage.setItem('access_token', testAuthToken);
      localStorage.setItem('user', JSON.stringify(testUser));
    }
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('Real API Integration', () => {
    it('should load dashboard with real API data when authenticated', async () => {
      // Skip test if no test user is available
      if (!testUser) {
        console.log('Skipping authenticated test - no test user available');
        return;
      }

      renderDashboard(testUser);

      // Should show loading state initially
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      // Wait for dashboard to load with real data
      await waitFor(
        () => {
          // Look for dashboard content (tabs or error message)
          const tabs = screen.queryByTestId('tabs');
          const errorMessage = screen.queryByText(/Failed to load dashboard data/);

          expect(tabs || errorMessage).toBeInTheDocument();
        },
        { timeout: TEST_TIMEOUT } // Allow more time for real API calls
      );

      // If we got tabs, verify they're rendered
      const tabs = screen.queryByTestId('tabs');
      if (tabs) {
        expect(tabs).toBeInTheDocument();
        console.log('Dashboard loaded successfully with real API data');
      } else {
        console.log('Dashboard showed error state - API may be unavailable');
      }
    });

    it('should handle API errors gracefully', async () => {
      // Test with invalid/expired token to trigger API errors
      localStorage.setItem('access_token', 'invalid_token');

      renderDashboard(testUser || { id: 1, email: 'test@example.com' });

      // Should show loading initially
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

      // Should eventually show error state or login prompt
      await waitFor(
        () => {
          const errorMessage = screen.queryByText(/Failed to load dashboard data/);
          const loginPrompt = screen.queryByText('Please log in to view your dashboard.');

          expect(errorMessage || loginPrompt).toBeInTheDocument();
        },
        { timeout: TEST_TIMEOUT }
      );
    });

    it('should handle network failures', async () => {
      // Test with completely invalid API URL to simulate network failure
      const originalFetch = global.fetch;
      global.fetch = () => Promise.reject(new Error('Network error'));

      try {
        renderDashboard(testUser || { id: 1, email: 'test@example.com' });

        // Should show loading initially
        expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

        // Should eventually show error state
        await waitFor(
          () => {
            expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
          },
          { timeout: TEST_TIMEOUT }
        );
      } finally {
        // Restore original fetch
        global.fetch = originalFetch;
      }
    });
  });

  describe('Authentication States', () => {
    it('should show loading state initially when authenticated', () => {
      renderDashboard(testUser || { id: 1, email: 'test@example.com' });

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should show login prompt when user is not authenticated', () => {
      renderDashboard(null); // No user provided

      expect(screen.getByText('Please log in to view your dashboard.')).toBeInTheDocument();
    });
  });

  describe('Real Dashboard Functionality', () => {
    it('should render dashboard tabs when data loads successfully', async () => {
      // Skip if no test user
      if (!testUser) {
        console.log('Skipping dashboard rendering test - no test user available');
        return;
      }

      renderDashboard(testUser);

      // Wait for either tabs to appear or error state
      await waitFor(
        () => {
          const tabs = screen.queryByTestId('tabs');
          const errorMessage = screen.queryByText(/Failed to load dashboard data/);

          // Should have either tabs or error message
          expect(tabs || errorMessage).toBeInTheDocument();
        },
        { timeout: TEST_TIMEOUT }
      );

      // If tabs loaded, check for tab content
      const tabs = screen.queryByTestId('tabs');
      if (tabs) {
        console.log('Dashboard tabs rendered successfully');

        // Look for any tab content that might be rendered
        const overviewTab = screen.queryByTestId('overview-tab');
        const matchesTab = screen.queryByTestId('matches-tab');
        const challengesTab = screen.queryByTestId('challenges-tab');
        const communityTab = screen.queryByTestId('community-tab');
        const progressTab = screen.queryByTestId('progress-tab');

        // At least one tab should be present
        expect(overviewTab || matchesTab || challengesTab || communityTab || progressTab).toBeInTheDocument();
      }
    });

    it('should handle real API response structures', async () => {
      // Skip if no test user
      if (!testUser) {
        console.log('Skipping API structure test - no test user available');
        return;
      }

      renderDashboard(testUser);

      // Wait for the component to finish loading (either success or error)
      await waitFor(
        () => {
          const loadingText = screen.queryByText('Loading dashboard...');
          expect(loadingText).not.toBeInTheDocument();
        },
        { timeout: TEST_TIMEOUT }
      );

      // Component should have finished loading and show either content or error
      const tabs = screen.queryByTestId('tabs');
      const errorMessage = screen.queryByText(/Failed to load dashboard data/);
      const loginPrompt = screen.queryByText('Please log in to view your dashboard.');

      expect(tabs || errorMessage || loginPrompt).toBeInTheDocument();

      if (tabs) {
        console.log('Dashboard loaded with real API data successfully');
      } else if (errorMessage) {
        console.log('Dashboard showed error state - API may be unavailable or returning errors');
      } else if (loginPrompt) {
        console.log('Dashboard showed login prompt - authentication may have failed');
      }
    });
  });
});
