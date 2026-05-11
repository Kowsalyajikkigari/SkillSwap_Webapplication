/**
 * Find Skills Page
 * Main search and discovery page for skill providers
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid, List, Filter, SlidersHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { ProviderCard } from '../components/search/ProviderCard';
import { SearchFilters } from '../components/search/SearchFilters';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../contexts/AuthContext';
import { skillCategories, sortOptions } from '../types/search.types';
import { cn } from '../lib/utils';
import { VoiceCallButton } from '../components/voice';

const FindSkills: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    filters,
    results,
    isLoading,
    error,
    viewMode,
    hasResults,
    hasMore,
    totalCount,
    updateFilters,
    debouncedSearch,
    performSearch,
    loadMore,
    clearFilters,
    setViewMode,
    setSortBy
  } = useSearch();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Handle quick category filter
  const handleQuickCategoryFilter = (categoryId: string) => {
    const isSelected = filters.categories.includes(categoryId);
    const newCategories = isSelected
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    updateFilters({ categories: newCategories });
  };

  // Handle booking session
  const handleBookSession = (providerId: string) => {
    if (!user) {
      navigate('/login', { state: { from: `/book/${providerId}` } });
      return;
    }
    navigate(`/book/${providerId}`);
  };

  // Handle sending message
  const handleSendMessage = (providerId: string) => {
    if (!user) {
      navigate('/login', { state: { from: `/messages/new/${providerId}` } });
      return;
    }
    navigate(`/messages/new/${providerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Skills</h1>
              <p className="text-gray-600">
                Discover talented instructors and learn new skills from experts around the world
              </p>
            </div>

            {/* Voice Search Button */}
            {user && (
              <div className="mt-4 sm:mt-0">
                <VoiceCallButton
                  sessionType="skill_discovery"
                  skillType={filters.query || 'general'}
                  contextData={{
                    current_search: filters.query,
                    selected_categories: filters.categories,
                    page_context: 'find_skills'
                  }}
                  className="w-full sm:w-auto"
                />
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for skills, instructors, or topics..."
              value={filters.query}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-3 text-lg border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        {/* Quick Category Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {skillCategories.slice(0, 6).map((category) => (
              <Badge
                key={category.id}
                variant={filters.categories.includes(category.id) ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-primary/80",
                  filters.categories.includes(category.id) && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleQuickCategoryFilter(category.id)}
              >
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <SearchFilters
                filters={filters}
                onFiltersChange={updateFilters}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {/* Mobile Filters Button */}
                <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <SearchFilters
                        filters={filters}
                        onFiltersChange={updateFilters}
                        onClearFilters={clearFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Results Count */}
                {hasResults && (
                  <div className="text-gray-600">
                    {totalCount} {totalCount === 1 ? 'instructor' : 'instructors'} found
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <Select value={filters.sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && !results && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">Searching for instructors...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <h3 className="font-medium text-red-800">Search Error</h3>
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(1, true)}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {!isLoading && !error && results && results.providers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No instructors found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters to find more results.
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results Grid/List */}
            {hasResults && (
              <>
                <div className={cn(
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                )}>
                  {results!.providers.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      viewMode={viewMode}
                      onBookSession={handleBookSession}
                      onSendMessage={handleSendMessage}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={isLoading}
                      className="px-8"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State for New Users */}
            {!isLoading && !error && !results && !filters.query && filters.categories.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start your learning journey
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Search for skills you want to learn or browse by category to find expert instructors.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {skillCategories.slice(0, 4).map((category) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleQuickCategoryFilter(category.id)}
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindSkills;
