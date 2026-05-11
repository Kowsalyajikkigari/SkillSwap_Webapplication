import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as authService from '../auth.service';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token Management', () => {
    it('should retrieve access token', () => {
      const testToken = 'test-token';
      localStorageMock.getItem.mockReturnValue(testToken);

      const token = authService.getToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(token).toBe(testToken);
    });

    it('should clear all tokens', () => {
      authService.clearTokens();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('User Management', () => {
    it('should get current user from localStorage', () => {
      const testUser = { id: 1, email: 'test@example.com', firstName: 'Test' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testUser));

      const user = authService.getCurrentUser();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('user');
      expect(user).toEqual(testUser);
    });

    it('should return null if no user in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('Authentication Status', () => {
    it('should return true when user is authenticated', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'token') return 'valid-token';
        if (key === 'user') return JSON.stringify({ id: 1, email: 'test@example.com' });
        return null;
      });

      const isAuthenticated = authService.isAuthenticated();

      expect(isAuthenticated).toBe(true);
    });

    it('should return false when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const isAuthenticated = authService.isAuthenticated();

      expect(isAuthenticated).toBe(false);
    });
  });
});
