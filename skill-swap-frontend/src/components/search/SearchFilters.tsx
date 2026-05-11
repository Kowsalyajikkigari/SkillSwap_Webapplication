/**
 * SearchFilters Component
 * Sidebar filters for the Find Skills page
 */

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Star, DollarSign, MapPin, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { SearchFilters as SearchFiltersType, skillCategories, skillLevels } from '../../types/search.types';
import { cn } from '../../lib/utils';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: Partial<SearchFiltersType>) => void;
  onClearFilters: () => void;
  className?: string;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}) => {
  // Collapsible sections state
  const [openSections, setOpenSections] = useState({
    categories: true,
    skillLevels: true,
    location: false,
    availability: false,
    rating: false,
    pricing: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter(id => id !== categoryId);
    
    onFiltersChange({ categories: newCategories });
  };

  // Handle skill level selection
  const handleSkillLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...filters.skillLevels, level as any]
      : filters.skillLevels.filter(l => l !== level);
    
    onFiltersChange({ skillLevels: newLevels });
  };

  // Handle rating change
  const handleRatingChange = (rating: number) => {
    onFiltersChange({ 
      rating: { minimum: rating } 
    });
  };

  // Handle price range change
  const handlePriceRangeChange = (range: number[]) => {
    onFiltersChange({
      priceRange: {
        min: range[0],
        max: range[1]
      }
    });
  };

  // Handle location change
  const handleLocationChange = (city: string) => {
    onFiltersChange({
      location: { ...filters.location, city }
    });
  };

  // Handle availability filters
  const handleAvailabilityChange = (type: 'availableToday' | 'availableThisWeek', checked: boolean) => {
    onFiltersChange({
      availability: {
        ...filters.availability,
        [type]: checked
      }
    });
  };

  // Count active filters
  const activeFiltersCount = 
    filters.categories.length +
    filters.skillLevels.length +
    (filters.location.city ? 1 : 0) +
    (filters.availability.availableToday ? 1 : 0) +
    (filters.availability.availableThisWeek ? 1 : 0) +
    (filters.rating.minimum > 0 ? 1 : 0) +
    (filters.priceRange.min !== undefined || filters.priceRange.max !== undefined ? 1 : 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with clear filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Categories Filter */}
      <Card>
        <Collapsible open={openSections.categories} onOpenChange={() => toggleSection('categories')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center">
                  <span className="mr-2">🏷️</span>
                  Categories
                </span>
                {openSections.categories ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {skillCategories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Skill Levels Filter */}
      <Card>
        <Collapsible open={openSections.skillLevels} onOpenChange={() => toggleSection('skillLevels')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center">
                  <span className="mr-2">📊</span>
                  Skill Level
                </span>
                {openSections.skillLevels ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {skillLevels.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={filters.skillLevels.includes(level)}
                      onCheckedChange={(checked) => 
                        handleSkillLevelChange(level, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`level-${level}`}
                      className="cursor-pointer flex-1"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Location Filter */}
      <Card>
        <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </span>
                {openSections.location ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city name"
                    value={filters.location.city || ''}
                    onChange={(e) => handleLocationChange(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Availability Filter */}
      <Card>
        <Collapsible open={openSections.availability} onOpenChange={() => toggleSection('availability')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Availability
                </span>
                {openSections.availability ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available-today"
                    checked={filters.availability.availableToday || false}
                    onCheckedChange={(checked) => 
                      handleAvailabilityChange('availableToday', checked as boolean)
                    }
                  />
                  <Label htmlFor="available-today" className="cursor-pointer">
                    Available today
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available-week"
                    checked={filters.availability.availableThisWeek || false}
                    onCheckedChange={(checked) => 
                      handleAvailabilityChange('availableThisWeek', checked as boolean)
                    }
                  />
                  <Label htmlFor="available-week" className="cursor-pointer">
                    Available this week
                  </Label>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Rating Filter */}
      <Card>
        <Collapsible open={openSections.rating} onOpenChange={() => toggleSection('rating')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Minimum Rating
                </span>
                {openSections.rating ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {[4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={filters.rating.minimum >= rating}
                      onCheckedChange={(checked) => 
                        handleRatingChange(checked ? rating : 0)
                      }
                    />
                    <Label 
                      htmlFor={`rating-${rating}`}
                      className="flex items-center space-x-1 cursor-pointer"
                    >
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < rating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "fill-gray-200 text-gray-200"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm">& up</span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Pricing Filter */}
      <Card>
        <Collapsible open={openSections.pricing} onOpenChange={() => toggleSection('pricing')}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Price Range
                </span>
                {openSections.pricing ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="min-price" className="text-sm">Min</Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="$0"
                      value={filters.priceRange.min || ''}
                      onChange={(e) => onFiltersChange({
                        priceRange: {
                          ...filters.priceRange,
                          min: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="max-price" className="text-sm">Max</Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="$200"
                      value={filters.priceRange.max || ''}
                      onChange={(e) => onFiltersChange({
                        priceRange: {
                          ...filters.priceRange,
                          max: e.target.value ? parseInt(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free-sessions"
                    checked={filters.priceRange.free || false}
                    onCheckedChange={(checked) => onFiltersChange({
                      priceRange: {
                        ...filters.priceRange,
                        free: checked as boolean
                      }
                    })}
                  />
                  <Label htmlFor="free-sessions" className="cursor-pointer">
                    Free sessions only
                  </Label>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
