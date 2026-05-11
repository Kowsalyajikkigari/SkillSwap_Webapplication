/**
 * Book Session Page
 * Allows users to book sessions with skill providers
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, User, Star, MapPin, ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { addCacheBusting } from '../services/profiles';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  duration: number;
}

interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  location: string;
  bio: string;
  skills: string[];
}

const BookSession: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Mock time slots for demonstration
  const timeSlots: TimeSlot[] = [
    { id: '1', date: '2025-06-02', time: '09:00', available: true, duration: 60 },
    { id: '2', date: '2025-06-02', time: '10:00', available: true, duration: 60 },
    { id: '3', date: '2025-06-02', time: '14:00', available: false, duration: 60 },
    { id: '4', date: '2025-06-02', time: '15:00', available: true, duration: 60 },
    { id: '5', date: '2025-06-03', time: '09:00', available: true, duration: 60 },
    { id: '6', date: '2025-06-03', time: '11:00', available: true, duration: 60 },
    { id: '7', date: '2025-06-03', time: '16:00', available: true, duration: 60 },
  ];

  // Mock provider data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProvider({
        id: providerId || '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        rating: 4.9,
        reviewCount: 127,
        hourlyRate: 75,
        location: 'San Francisco, CA',
        bio: 'Full-stack developer with 5+ years of experience in React and Node.js. I love helping others learn modern web development techniques.',
        skills: ['React', 'Node.js', 'TypeScript', 'JavaScript']
      });
      setIsLoading(false);
    }, 1000);
  }, [providerId]);

  const handleBookSession = async () => {
    if (!selectedTimeSlot || !provider) return;
    
    setIsBooking(true);
    
    // Simulate booking API call
    setTimeout(() => {
      setIsBooking(false);
      // Navigate to success page or sessions page
      navigate('/sessions', { 
        state: { 
          message: `Session booked successfully with ${provider.firstName} ${provider.lastName}!` 
        }
      });
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to book a session.
            </p>
            <div className="space-y-3">
              <Link to="/login" className="block">
                <Button className="w-full">Login</Button>
              </Link>
              <Link to="/register" className="block">
                <Button variant="outline" className="w-full">Sign Up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading provider information...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Provider Not Found</h2>
            <p className="text-gray-600 mb-6">
              The skill provider you're looking for could not be found.
            </p>
            <Link to="/search">
              <Button>Back to Search</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/search" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Book a Session</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Provider Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={addCacheBusting(provider.avatar)} alt={`${provider.firstName} ${provider.lastName}`} />
                    <AvatarFallback className="text-xl">
                      {provider.firstName.charAt(0)}{provider.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">
                    {provider.firstName} {provider.lastName}
                  </h2>
                  <div className="flex items-center justify-center space-x-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{provider.rating}</span>
                    <span className="text-gray-500">({provider.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center justify-center text-gray-600 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{provider.location}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-gray-600 text-sm">{provider.bio}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hourly Rate</span>
                      <span className="text-2xl font-bold">${provider.hourlyRate}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select a Time Slot</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {/* Time Slots */}
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Available Times</h3>
                  <div className="space-y-4">
                    {Object.entries(
                      timeSlots.reduce((acc, slot) => {
                        if (!acc[slot.date]) acc[slot.date] = [];
                        acc[slot.date].push(slot);
                        return acc;
                      }, {} as Record<string, TimeSlot[]>)
                    ).map(([date, slots]) => (
                      <div key={date}>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {formatDate(date)}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {slots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                              disabled={!slot.available}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className="justify-start"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              {formatTime(slot.time)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell the instructor what you'd like to learn or any specific topics you want to cover..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                {/* Session Summary */}
                {selectedTimeSlot && (
                  <Card className="bg-gray-50 mb-6">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-3">Session Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{formatDate(selectedTimeSlot.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span>{formatTime(selectedTimeSlot.time)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{selectedTimeSlot.duration} minutes</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total Cost:</span>
                          <span>${provider.hourlyRate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Book Button */}
                <Button
                  onClick={handleBookSession}
                  disabled={!selectedTimeSlot || isBooking}
                  className="w-full"
                  size="lg"
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking Session...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Book Session
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSession;
