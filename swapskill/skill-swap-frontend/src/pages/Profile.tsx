import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MessageCircle, Star, Clock, MapPin, Award, ThumbsUp, User, Users, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { getCurrentUserProfile, getProfileById, UserProfileData, addCacheBusting } from "@/services/profiles";
import { getTeachingSkills, getLearningSkills } from "@/services/skills";
import { sendSkillSwapRequest } from "@/services/skillSwapRequests";
import { useAuth } from "@/contexts/AuthContext";

// Interface for the transformed user data
interface TransformedUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  location: string;
  memberSince: string;
  bio: string;
  rating: number;
  exchanges: number;
  completionRate: number;
  responseRate: number;
  responseTime: string;
  teachSkills: Array<{ name: string; level: string; description: string }>;
  learnSkills: Array<{ name: string; level: string; description: string }>;
  availability: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
  reviews: Array<{
    id: number;
    user: { name: string; avatar: string };
    rating: number;
    date: string;
    skill: string;
    content: string;
  }>;
  portfolio: Array<{ id: number; title: string; image: string }>;
  badges: Array<{ id: number; name: string; icon: string }>;
}

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<TransformedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Skill swap request form state
  const [requestForm, setRequestForm] = useState({
    wantToLearn: '',
    canOffer: '',
    preferredSchedule: [] as string[],
    message: ''
  });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Handle skill selection for "want to learn"
  const handleWantToLearnSkill = (skillName: string) => {
    console.log('🎯 Want to learn skill clicked:', skillName);
    setRequestForm(prev => {
      const newValue = prev.wantToLearn === skillName ? '' : skillName;
      console.log('📝 Updated wantToLearn:', newValue);
      return {
        ...prev,
        wantToLearn: newValue
      };
    });
  };

  // Handle skill selection for "can offer"
  const handleCanOfferSkill = (skillName: string) => {
    console.log('🎯 Can offer skill clicked:', skillName);
    setRequestForm(prev => {
      const newValue = prev.canOffer === skillName ? '' : skillName;
      console.log('📝 Updated canOffer:', newValue);
      return {
        ...prev,
        canOffer: newValue
      };
    });
  };

  // Handle schedule selection
  const handleScheduleToggle = (schedule: string) => {
    console.log('🎯 Schedule clicked:', schedule);
    setRequestForm(prev => {
      const newSchedule = prev.preferredSchedule.includes(schedule)
        ? prev.preferredSchedule.filter(s => s !== schedule)
        : [...prev.preferredSchedule, schedule];
      console.log('📝 Updated preferredSchedule:', newSchedule);
      return {
        ...prev,
        preferredSchedule: newSchedule
      };
    });
  };

  // Handle skill swap request submission
  const handleSendRequest = async () => {
    console.log('🔘 Send Request button clicked!');
    console.log('📋 Current form state:', requestForm);
    console.log('👤 Current user:', currentUser);
    console.log('👥 Target user:', user);

    if (!user || !currentUser) {
      console.log('❌ Validation failed: Missing user data');
      alert('Please log in to send a request.');
      return;
    }

    if (!requestForm.wantToLearn || !requestForm.canOffer) {
      console.log('❌ Validation failed: Missing skill selections');
      alert('Please select both a skill to learn and a skill to offer.');
      return;
    }

    if (requestForm.preferredSchedule.length === 0) {
      console.log('❌ Validation failed: No schedule selected');
      alert('Please select at least one preferred schedule option.');
      return;
    }

    console.log('✅ All validations passed, proceeding with request...');

    try {
      setIsSubmittingRequest(true);

      // Prepare the request data
      const requestData = {
        fromUserId: Number(currentUser.id),
        toUserId: user.id,
        wantToLearn: requestForm.wantToLearn,
        canOffer: requestForm.canOffer,
        preferredSchedule: requestForm.preferredSchedule,
        message: requestForm.message || `Hi ${user.name}! I'd like to learn ${requestForm.wantToLearn} and can offer ${requestForm.canOffer} in return.`
      };

      // Send the request using the service
      await sendSkillSwapRequest(requestData);

      // Show success message
      alert(`✅ Skill swap request sent to ${user.name}! They will be notified and can respond through their dashboard.`);

      // Reset form and hide it
      setRequestForm({
        wantToLearn: '',
        canOffer: '',
        preferredSchedule: [],
        message: ''
      });
      setShowRequestForm(false);

    } catch (error) {
      console.error('❌ Error sending skill swap request:', error);
      alert(`Failed to send request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Transform backend data to frontend format
  const transformUserData = async (profileData: UserProfileData): Promise<TransformedUser> => {
    // Fetch teaching and learning skills
    let teachSkills: Array<{ name: string; level: string; description: string }> = [];
    let learnSkills: Array<{ name: string; level: string; description: string }> = [];

    try {
      const [teachingSkillsData, learningSkillsData] = await Promise.all([
        getTeachingSkills(),
        getLearningSkills()
      ]);

      teachSkills = teachingSkillsData.map(skill => ({
        name: skill.skill_name,
        level: (skill as any).proficiency_level || 'Intermediate',
        description: (skill as any).description || `${skill.skill_name} expertise`
      }));

      learnSkills = learningSkillsData.map(skill => ({
        name: skill.skill_name,
        level: (skill as any).desired_level || 'Beginner',
        description: (skill as any).description || `Learning ${skill.skill_name}`
      }));
    } catch (error) {
      console.error('Error fetching skills:', error);
    }

    // Format member since date
    const memberSince = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });

    return {
      id: profileData.id,
      name: `${profileData.first_name} ${profileData.last_name}`.trim() || 'User',
      username: profileData.email.split('@')[0],
      avatar: addCacheBusting(profileData.avatar) || `https://i.pravatar.cc/150?u=${profileData.id}`,
      coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000",
      location: profileData.location || 'Location not specified',
      memberSince,
      bio: profileData.bio || 'No bio available',
      rating: profileData.profile.average_rating || 0,
      exchanges: profileData.profile.sessions_completed || 0,
      completionRate: 98, // This would come from backend calculation
      responseRate: 95, // This would come from backend calculation
      responseTime: "Within 2 hours", // This would come from backend
      teachSkills,
      learnSkills,
      availability: {
        weekdays: profileData.profile.available_weekdays,
        weekends: profileData.profile.available_weekends,
        mornings: profileData.profile.available_mornings,
        afternoons: profileData.profile.available_afternoons,
        evenings: profileData.profile.available_evenings,
      },
      reviews: [], // Reviews would be fetched separately
      portfolio: [], // Portfolio would be fetched separately
      badges: [
        { id: 1, name: "Verified User", icon: "check-circle" },
        ...(profileData.profile.average_rating >= 4.5 ? [{ id: 2, name: "Top Rated", icon: "award" }] : []),
        ...(profileData.profile.sessions_completed >= 10 ? [{ id: 3, name: "Experienced", icon: "zap" }] : [])
      ]
    };
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let profileData: UserProfileData;

        if (id && id !== currentUser?.id?.toString()) {
          // Viewing another user's profile - this would need a different endpoint
          // For now, we'll use the current user's profile as fallback
          profileData = await getCurrentUserProfile();
        } else {
          // Viewing own profile
          profileData = await getCurrentUserProfile();
        }

        const transformedUser = await transformUserData(profileData);
        setUser(transformedUser);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Profile</CardTitle>
            <CardDescription>{error || 'Profile not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image and Profile Header */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 to-secondary/20">
        {user.coverImage && (
          <img 
            src={user.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24">
          <div className="bg-card rounded-xl shadow-lg border border-muted/50 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 ring-4 ring-background">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="mt-4 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {user.location}
                  </p>
                  <p className="text-muted-foreground flex items-center justify-center md:justify-start mt-1">
                    <User className="h-4 w-4 mr-1" />
                    Member since {user.memberSince}
                  </p>
                </div>
                
                <div className="flex items-center mt-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= Math.floor(user.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-medium">{user.rating}</span>
                  <span className="text-sm text-muted-foreground ml-2">({user.exchanges} exchanges)</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.badges.map(badge => (
                    <Badge key={badge.id} variant="secondary" className="px-2 py-1">
                      {badge.icon === "award" && <Award className="h-3 w-3 mr-1" />}
                      {badge.icon === "zap" && <Clock className="h-3 w-3 mr-1" />}
                      {badge.icon === "check-circle" && <ThumbsUp className="h-3 w-3 mr-1" />}
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 mt-6 md:mt-0">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{user.exchanges}</p>
                      <p className="text-sm text-muted-foreground">Exchanges</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{user.completionRate}%</p>
                      <p className="text-sm text-muted-foreground">Completion</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold">{user.responseRate}%</p>
                      <p className="text-sm text-muted-foreground">Response</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => setShowRequestForm(!showRequestForm)} className="flex-1">
                      Request Skill Swap
                    </Button>
                    <Link to={`/message/${user.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {showRequestForm && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Request Skill Swap</CardTitle>
                      <CardDescription>
                        Choose a skill you want to learn and offer one in return
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">I want to learn:</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {user.teachSkills.map(skill => (
                              <Badge
                                key={skill.name}
                                variant={requestForm.wantToLearn === skill.name ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => handleWantToLearnSkill(skill.name)}
                              >
                                {skill.name}
                              </Badge>
                            ))}
                          </div>
                          {requestForm.wantToLearn && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Selected: {requestForm.wantToLearn}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">I can offer:</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* Show current user's teaching skills */}
                            {currentUser ? (
                              <>
                                <Badge
                                  variant={requestForm.canOffer === "Web Development" ? "default" : "outline"}
                                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                                  onClick={() => handleCanOfferSkill("Web Development")}
                                >
                                  Web Development
                                </Badge>
                                <Badge
                                  variant={requestForm.canOffer === "JavaScript" ? "default" : "outline"}
                                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                                  onClick={() => handleCanOfferSkill("JavaScript")}
                                >
                                  JavaScript
                                </Badge>
                                <Badge
                                  variant={requestForm.canOffer === "React" ? "default" : "outline"}
                                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                                  onClick={() => handleCanOfferSkill("React")}
                                >
                                  React
                                </Badge>
                                <Badge
                                  variant={requestForm.canOffer === "Node.js" ? "default" : "outline"}
                                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                                  onClick={() => handleCanOfferSkill("Node.js")}
                                >
                                  Node.js
                                </Badge>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">Please log in to see your skills</p>
                            )}
                          </div>
                          {requestForm.canOffer && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Selected: {requestForm.canOffer}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Preferred schedule:</label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              variant={requestForm.preferredSchedule.includes("Weekdays") ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={() => handleScheduleToggle("Weekdays")}
                            >
                              Weekdays
                            </Badge>
                            <Badge
                              variant={requestForm.preferredSchedule.includes("Evenings") ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={() => handleScheduleToggle("Evenings")}
                            >
                              Evenings
                            </Badge>
                            <Badge
                              variant={requestForm.preferredSchedule.includes("Weekends") ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={() => handleScheduleToggle("Weekends")}
                            >
                              Weekends
                            </Badge>
                          </div>
                          {requestForm.preferredSchedule.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Selected: {requestForm.preferredSchedule.join(', ')}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium">Message (Optional):</label>
                          <textarea
                            className="w-full mt-2 p-2 border border-muted rounded-md text-sm"
                            placeholder={`Hi ${user.name}! I'd like to learn more about skill swapping with you...`}
                            value={requestForm.message}
                            onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                            rows={3}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                        Cancel
                      </Button>
                      <div className="flex gap-2">
                        {/* Debug Test Button */}
                        <Button
                          variant="secondary"
                          onClick={() => {
                            console.log('🧪 Test button clicked!');
                            alert('Test button works!');
                          }}
                        >
                          Test
                        </Button>
                        <Button
                          onClick={handleSendRequest}
                          disabled={isSubmittingRequest || !requestForm.wantToLearn || !requestForm.canOffer || requestForm.preferredSchedule.length === 0}
                        >
                          {isSubmittingRequest ? "Sending..." : "Send Request"}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )}
                
                <div>
                  <h2 className="text-xl font-semibold mb-2">About</h2>
                  <p className="text-muted-foreground">{user.bio}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Tabs defaultValue="skills">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>
            
            <TabsContent value="skills" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-primary" />
                      Skills to Share
                    </CardTitle>
                    <CardDescription>
                      Skills {user.name} can teach you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {user.teachSkills.map(skill => (
                        <div key={skill.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{skill.name}</h3>
                            <Badge>{skill.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-secondary" />
                      Skills to Learn
                    </CardTitle>
                    <CardDescription>
                      Skills {user.name} wants to learn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {user.learnSkills.map(skill => (
                        <div key={skill.name} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{skill.name}</h3>
                            <Badge variant="outline">{skill.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                          <Separator />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                  <CardDescription>
                    What others are saying about {user.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {user.reviews.map(review => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-start">
                          <Avatar className="h-10 w-10 mr-4">
                            <AvatarImage src={review.user.avatar} />
                            <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{review.user.name}</h3>
                                <p className="text-xs text-muted-foreground">{review.date}</p>
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <Badge variant="outline" className="mt-1 mb-2">{review.skill}</Badge>
                            <p className="text-sm">{review.content}</p>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="portfolio" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>
                    Examples of {user.name}'s work
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {user.portfolio.map(item => (
                      <div key={item.id} className="group relative overflow-hidden rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <p className="text-white text-sm font-medium">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="availability" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                    Availability
                  </CardTitle>
                  <CardDescription>
                    When {user.name} is available for skill exchanges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border ${user.availability.weekdays ? "bg-primary/10 border-primary" : "bg-muted border-muted"}`}>
                      <h3 className="font-medium">Weekdays</h3>
                      <p className="text-sm text-muted-foreground">Monday - Friday</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${user.availability.weekends ? "bg-primary/10 border-primary" : "bg-muted border-muted"}`}>
                      <h3 className="font-medium">Weekends</h3>
                      <p className="text-sm text-muted-foreground">Saturday - Sunday</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${user.availability.mornings ? "bg-primary/10 border-primary" : "bg-muted border-muted"}`}>
                      <h3 className="font-medium">Mornings</h3>
                      <p className="text-sm text-muted-foreground">8:00 AM - 12:00 PM</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${user.availability.afternoons ? "bg-primary/10 border-primary" : "bg-muted border-muted"}`}>
                      <h3 className="font-medium">Afternoons</h3>
                      <p className="text-sm text-muted-foreground">12:00 PM - 5:00 PM</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${user.availability.evenings ? "bg-primary/10 border-primary" : "bg-muted border-muted"}`}>
                      <h3 className="font-medium">Evenings</h3>
                      <p className="text-sm text-muted-foreground">5:00 PM - 10:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-2">Response Time</h3>
                    <p className="text-sm text-muted-foreground mb-2">Usually responds {user.responseTime}</p>
                    <Progress value={user.responseRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{user.responseRate}% response rate</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
