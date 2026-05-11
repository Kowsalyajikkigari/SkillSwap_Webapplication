/**
 * useSearch Hook
 * Manages search state and API calls for the Find Skills page
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  SearchFilters, 
  SearchResults, 
  SearchState, 
  defaultSearchFilters,
  ViewMode,
  SortOption 
} from '../types/search.types';
import { searchSkillProviders, getMockSearchResults } from '../services/search.service';
import { USE_MOCK_DATA } from '../config/api.config';

// Debounce delay for search input
const SEARCH_DEBOUNCE_DELAY = 500;

export const useSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state
  const [state, setState] = useState<SearchState>({
    filters: {
      ...defaultSearchFilters,
      query: searchParams.get('q') || '',
      categories: searchParams.getAll('category'),
      skillLevels: searchParams.getAll('level') as any[],
      sortBy: (searchParams.get('sort') as SortOption) || 'relevance'
    },
    results: null,
    isLoading: false,
    error: null,
    viewMode: (searchParams.get('view') as ViewMode) || 'grid'
  });

  // Debounced search timer
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Update search filters
   */
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters }
    }));
  }, []);

  /**
   * Update view mode
   */
  const setViewMode = useCallback((viewMode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode }));
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    params.set('view', viewMode);
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  /**
   * Update sort option
   */
  const setSortBy = useCallback((sortBy: SortOption) => {
    updateFilters({ sortBy });
  }, [updateFilters]);

  /**
   * Perform search with current filters
   */
  const performSearch = useCallback(async (page: number = 1, resetResults: boolean = true) => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      results: resetResults ? null : prev.results
    }));

    try {
      let results: SearchResults;
      
      if (USE_MOCK_DATA) {
        // Use mock data for development
        console.log('🔍 Using mock search data');
        results = getMockSearchResults(state.filters, page);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        // Use real API
        results = await searchSkillProviders(state.filters, page);
      }

      setState(prev => ({
        ...prev,
        results: resetResults ? results : {
          ...results,
          providers: [...(prev.results?.providers || []), ...results.providers]
        },
        isLoading: false
      }));

      // Update URL with search parameters
      updateUrlParams();

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Search failed. Please try again.',
        isLoading: false
      }));
    }
  }, [state.filters]);

  /**
   * Debounced search for text input
   */
  const debouncedSearch = useCallback((query: string) => {
    // Clear existing timer
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    // Update query immediately in state
    updateFilters({ query });

    // Set new timer for API call
    const timer = setTimeout(() => {
      performSearch(1, true);
    }, SEARCH_DEBOUNCE_DELAY);

    setSearchTimer(timer);
  }, [searchTimer, updateFilters, performSearch]);

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(() => {
    if (state.results && state.results.hasMore && !state.isLoading) {
      performSearch(state.results.currentPage + 1, false);
    }
  }, [state.results, state.isLoading, performSearch]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: { ...defaultSearchFilters },
      results: null
    }));
    
    // Clear URL params
    setSearchParams({});
  }, [setSearchParams]);

  /**
   * Update URL parameters based on current filters
   */
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (state.filters.query) {
      params.set('q', state.filters.query);
    }
    
    state.filters.categories.forEach(category => {
      params.append('category', category);
    });
    
    state.filters.skillLevels.forEach(level => {
      params.append('level', level);
    });
    
    if (state.filters.sortBy !== 'relevance') {
      params.set('sort', state.filters.sortBy);
    }
    
    if (state.viewMode !== 'grid') {
      params.set('view', state.viewMode);
    }
    
    setSearchParams(params);
  }, [state.filters, state.viewMode, setSearchParams]);

  /**
   * Initial search on component mount or when filters change
   */
  useEffect(() => {
    // Perform initial search if we have query or filters
    const hasActiveFilters = 
      state.filters.query ||
      state.filters.categories.length > 0 ||
      state.filters.skillLevels.length > 0;

    if (hasActiveFilters) {
      performSearch(1, true);
    }
  }, [
    state.filters.categories,
    state.filters.skillLevels,
    state.filters.sortBy,
    state.filters.location,
    state.filters.availability,
    state.filters.rating,
    state.filters.priceRange,
    state.filters.sessionTypes
  ]);

  /**
   * Cleanup timer on unmount
   */
  useEffect(() => {
    return () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
    };
  }, [searchTimer]);

  return {
    // State
    filters: state.filters,
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    viewMode: state.viewMode,
    
    // Actions
    updateFilters,
    debouncedSearch,
    performSearch,
    loadMore,
    clearFilters,
    setViewMode,
    setSortBy,
    
    // Computed values
    hasResults: !!state.results?.providers.length,
    hasMore: !!state.results?.hasMore,
    totalCount: state.results?.totalCount || 0,
    currentPage: state.results?.currentPage || 1,
    totalPages: state.results?.totalPages || 0,
  };
};
