/**
 * ProviderCard Component
 * Displays skill provider information in search results
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { SkillProvider, ViewMode } from '../../types/search.types';
import { cn } from '../../lib/utils';

interface ProviderCardProps {
  provider: SkillProvider;
  viewMode: ViewMode;
  onBookSession: (providerId: string) => void;
  onSendMessage: (providerId: string) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  viewMode,
  onBookSession,
  onSendMessage
}) => {
  const primarySkill = provider.skills[0];
  const skillTags = primarySkill?.tags?.slice(0, 3) || [];
  
  // Generate star rating display
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "fill-gray-200 text-gray-200"
        )}
      />
    ));
  };

  // Format location display
  const formatLocation = () => {
    const { city, state, country } = provider.location;
    if (city === 'Remote' || country === 'Online') {
      return '🌐 Remote';
    }
    return `${city}${state ? `, ${state}` : ''}`;
  };

  // Grid view layout
  if (viewMode === 'grid') {
    return (
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 border border-gray-200">
        <CardContent className="p-6">
          {/* Header with avatar and basic info */}
          <div className="flex items-start space-x-4 mb-4">
            <Avatar className="h-12 w-12 border-2 border-gray-100">
              <AvatarImage 
                src={provider.avatar || `https://i.pravatar.cc/150?u=${provider.id}`} 
                alt={`${provider.firstName} ${provider.lastName}`} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {provider.firstName.charAt(0)}{provider.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {provider.firstName} {provider.lastName}
                </h3>
                {provider.verified && (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-1 mt-1">
                <div className="flex space-x-0.5">
                  {renderStars(provider.rating.average)}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {provider.rating.average.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({provider.rating.count})
                </span>
              </div>
            </div>
          </div>

          {/* Primary skill */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              {primarySkill?.name || 'General Skills'}
            </h4>
            <div className="flex flex-wrap gap-1">
              {skillTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location and pricing */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{formatLocation()}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <span className="font-semibold text-gray-900">
                  ${provider.pricing.hourlyRate}/hour
                </span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{provider.experience.sessionsCompleted}+ sessions</span>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="mb-4">
            <div className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              provider.availability.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full mr-2",
                provider.availability.isAvailable ? "bg-green-500" : "bg-gray-400"
              )} />
              {provider.availability.isAvailable 
                ? `Available ${provider.availability.nextAvailable || 'now'}`
                : 'Not available'
              }
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Link to={`/profile/${provider.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Profile
              </Button>
            </Link>
            
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onBookSession(provider.id)}
              disabled={!provider.availability.isAvailable}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Book
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSendMessage(provider.id)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List view layout
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <Avatar className="h-16 w-16 border-2 border-gray-100 flex-shrink-0">
            <AvatarImage 
              src={provider.avatar || `https://i.pravatar.cc/150?u=${provider.id}`} 
              alt={`${provider.firstName} ${provider.lastName}`} 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {provider.firstName.charAt(0)}{provider.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Name and verification */}
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {provider.firstName} {provider.lastName}
                  </h3>
                  {provider.verified && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex space-x-0.5">
                    {renderStars(provider.rating.average)}
                  </div>
                  <span className="font-medium text-gray-700">
                    {provider.rating.average.toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({provider.rating.count} reviews)
                  </span>
                </div>
                
                {/* Skills and bio */}
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {primarySkill?.name || 'General Skills'}
                  </h4>
                  {provider.bio && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {provider.bio}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {skillTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Location and stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{formatLocation()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{provider.experience.sessionsCompleted}+ sessions</span>
                  </div>
                </div>
              </div>
              
              {/* Right side - pricing and actions */}
              <div className="text-right flex-shrink-0 ml-4">
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-900">
                    ${provider.pricing.hourlyRate}
                  </div>
                  <div className="text-sm text-gray-500">per hour</div>
                </div>
                
                {/* Availability */}
                <div className="mb-4">
                  <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    provider.availability.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      provider.availability.isAvailable ? "bg-green-500" : "bg-gray-400"
                    )} />
                    {provider.availability.isAvailable 
                      ? `Available ${provider.availability.nextAvailable || 'now'}`
                      : 'Not available'
                    }
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Link to={`/profile/${provider.id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </Link>
                    <Button 
                      size="sm"
                      onClick={() => onSendMessage(provider.id)}
                      variant="outline"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => onBookSession(provider.id)}
                    disabled={!provider.availability.isAvailable}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Session
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
