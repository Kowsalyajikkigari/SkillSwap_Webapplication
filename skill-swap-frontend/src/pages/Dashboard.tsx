import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useVoice } from "../contexts/VoiceContext";
import {
  getDashboardStats,
  DashboardStats,
  getUpcomingSessions,
  getRecommendedUsers,
  getUserTeachingSkills,
  getUserLearningSkills
} from "../services/dashboard.service";
import { getCurrentUserProfile, addCacheBusting } from "../services/profiles";
import { avatarSyncService } from "../services/avatar-sync.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar, MessageCircle, Users, Award, Star, Clock, ChevronRight, Bell, Settings, User, BookOpen, BarChart2, Zap, CheckCircle, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { VoiceInterface } from "../components/voice";


// Mock user data
const mockUser = {
  name: "Jane Doe",
  avatar: "https://i.pravatar.cc/150?img=32",
  level: 3,
  points: 750,
  nextLevelPoints: 1000,
  memberSince: "January 2022",
  stats: {
    sessionsCompleted: 24,
    skillsShared: 3,
    skillsLearned: 2,
    hoursExchanged: 36,
    averageRating: 4.8
  },
  badges: [
    { id: 1, name: "Top Rated", icon: "award", description: "Maintained a 4.5+ rating for 10+ sessions" },
    { id: 2, name: "Quick Responder", icon: "zap", description: "Responds to messages within 2 hours on average" },
    { id: 3, name: "Skill Master", icon: "star", description: "Received 5-star ratings for a specific skill" }
  ],
  teachSkills: [
    { name: "Graphic Design", sessions: 15, rating: 4.9 },
    { name: "UI/UX Design", sessions: 7, rating: 4.7 },
    { name: "Branding", sessions: 2, rating: 5.0 }
  ],
  learnSkills: [
    { name: "Web Development", sessions: 8, rating: 4.6 },
    { name: "Photography", sessions: 4, rating: 4.5 }
  ]
};

// Mock upcoming sessions
const mockUpcomingSessions = [
  {
    id: 1,
    user: {
      id: 2,
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=68"
    },
    skill: "Web Development",
    date: "Tomorrow",
    time: "10:00 AM - 11:30 AM",
    type: "Virtual"
  },
  {
    id: 2,
    user: {
      id: 3,
      name: "Alex Lee",
      avatar: "https://i.pravatar.cc/150?img=47"
    },
    skill: "Photography",
    date: "Saturday, Nov 18",
    time: "2:00 PM - 4:00 PM",
    type: "In-person"
  }
];

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    type: "message",
    user: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=68"
    },
    content: "sent you a message",
    time: "10 minutes ago",
    read: false
  },
  {
    id: 2,
    type: "session_request",
    user: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    content: "requested a Digital Marketing session",
    time: "2 hours ago",
    read: false
  },
  {
    id: 3,
    type: "feedback",
    user: {
      name: "Emily Wilson",
      avatar: "https://i.pravatar.cc/150?img=23"
    },
    content: "left you a 5-star review",
    time: "Yesterday",
    read: true
  },
  {
    id: 4,
    type: "level_up",
    content: "Congratulations! You've reached Level 3",
    time: "2 days ago",
    read: true
  }
];

// Mock recommended users
const mockRecommendedUsers = [
  {
    id: 5,
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?img=15",
    teachSkills: ["Mobile App Development", "Swift", "Flutter"],
    learnSkills: ["UI/UX Design", "Graphic Design"],
    match: 92
  },
  {
    id: 6,
    name: "Emily Wilson",
    avatar: "https://i.pravatar.cc/150?img=23",
    teachSkills: ["Content Writing", "Copywriting", "Editing"],
    learnSkills: ["Digital Marketing", "Photography"],
    match: 85
  },
  {
    id: 7,
    name: "David Kim",
    avatar: "https://i.pravatar.cc/150?img=12",
    teachSkills: ["Financial Planning", "Investment Strategies", "Budgeting"],
    learnSkills: ["Web Development", "Digital Marketing"],
    match: 78
  }
];

const Dashboard = () => {
  const { user: authUser, isLoading, refreshUserData } = useAuth();
  const { testPersonalizedCall, isLoading: voiceLoading, error: voiceError } = useVoice();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [notifications] = useState(mockNotifications);
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<any[]>([]);
  const [learningSkills, setLearningSkills] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [voiceTestResult, setVoiceTestResult] = useState<string>('');


  // Fetch all dashboard data
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchDashboardData = async () => {
      if (authUser) {
        try {
          setStatsLoading(true);
          setDataLoading(true);
          setProfileLoading(true);
          console.log('📊 Dashboard - Fetching all dashboard data...');

          const [
            stats,
            profile,
            sessions,
            recommended,
            teaching,
            learning
          ] = await Promise.allSettled([
            getDashboardStats({ signal }),
            getCurrentUserProfile({ signal }),
            getUpcomingSessions({ signal }),
            getRecommendedUsers({ signal }),
            getUserTeachingSkills({ signal }),
            getUserLearningSkills({ signal })
          ]);

          if (signal.aborted) {
            console.log('Dashboard fetch aborted on cleanup.');
            return;
          }

          if (stats.status === 'fulfilled') {
            console.log('📊 Dashboard - Stats received:', stats.value);
            setDashboardStats(stats.value);
          } else if (stats.reason.name !== 'CanceledError') {
            console.error('❌ Dashboard - Error fetching stats:', stats.reason);
          }

          if (profile.status === 'fulfilled') {
            console.log('👤 Dashboard - Profile data received:', profile.value);
            setProfileData(profile.value);
          } else if (profile.reason.name !== 'CanceledError') {
            console.error('❌ Dashboard - Error fetching profile:', profile.reason);
          }

          if (sessions.status === 'fulfilled') {
            console.log('📅 Dashboard - Sessions received:', sessions.value);
            const sessionsData = Array.isArray(sessions.value) ? sessions.value : [];
            // Filter out sessions with invalid data
            const validSessions = sessionsData.filter(session => 
              session && session.id && session.skill
            );
            setUpcomingSessions(validSessions);
          } else if (sessions.reason.name !== 'CanceledError') {
            console.error('❌ Dashboard - Error fetching sessions:', sessions.reason);
            setUpcomingSessions(mockUpcomingSessions);
          }

          if (recommended.status === 'fulfilled') {
            console.log('👥 Dashboard - Recommended users received:', recommended.value);
            const recommendedData = recommended.value || {};
            const allRecommended = [
              ...(Array.isArray(recommendedData.teachers) ? recommendedData.teachers : []),
              ...(Array.isArray(recommendedData.students) ? recommendedData.students : [])
            ];
            // Filter out users with invalid data
            const validRecommended = allRecommended.filter(user => 
              user && user.id
            );
            setRecommendedUsers(validRecommended);
          } else if (recommended.reason.name !== 'CanceledError') {
            console.error('❌ Dashboard - Error fetching recommended users:', recommended.reason);
            setRecommendedUsers(mockRecommendedUsers);
          }

          if (teaching.status === 'fulfilled') {
            console.log('🎓 Dashboard - Teaching skills received:', teaching.value);
            const teachingData = teaching.value?.results || teaching.value || [];
            const validTeachingSkills = Array.isArray(teachingData) ? teachingData : [];
            setTeachingSkills(validTeachingSkills);
          } else if (teaching.reason.name !== 'CanceledError') {
            console.error('❌ Dashboard - Error fetching teaching skills:', teaching.reason);
            setTeachingSkills([]);
          }

          if (learning.status === 'fulfilled') {
            console.log('📚 Dashboard - Learning skills received:', learning.value);
            const learningData = learning.value?.results || learning.value || [];
            const validLearningSkills = Array.isArray(learningData) ? learningData : [];
            setLearningSkills(validLearningSkills);
          } else if (learning.reason.name !== 'CanceledError') {
            console.error('❌ Dashboard - Error fetching learning skills:', learning.reason);
            setLearningSkills([]);
          }

        } catch (error) {
          if (error.name !== 'CanceledError') {
            console.error('❌ Dashboard - Unexpected error:', error);
          }
        } finally {
          if (!signal.aborted) {
            setStatsLoading(false);
            setDataLoading(false);
            setProfileLoading(false);
          }
        }
      } else {
        setStatsLoading(false);
        setDataLoading(false);
        setProfileLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      console.log('Cleanup: Aborting dashboard data fetch.');
      controller.abort();
    };
  }, [authUser]);

  // Voice AI test function
  const handleVoiceAITest = async () => {
    try {
      console.log('🧪 Dashboard: Testing personalized Voice AI...');
      setVoiceTestResult('Testing Voice AI...');

      const response = await testPersonalizedCall('personalized_assistant');

      if (response.success) {
        setVoiceTestResult(`✅ Voice AI test successful! Session ID: ${response.session_id}`);
        console.log('✅ Dashboard: Voice AI test completed successfully:', response);
      } else {
        setVoiceTestResult(`❌ Voice AI test failed: ${response.message || 'Unknown error'}`);
        console.error('❌ Dashboard: Voice AI test failed:', response);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      setVoiceTestResult(`❌ Voice AI test error: ${errorMessage}`);
      console.error('❌ Dashboard: Voice AI test error:', error);
    }
  };

  // Listen for avatar updates and refresh profile data
  useEffect(() => {
    const unsubscribe = avatarSyncService.subscribe((newAvatarUrl) => {
      console.log('🔄 Dashboard - Avatar updated, refreshing profile data...');
      refreshProfileData();
    });

    return unsubscribe;
  }, []);

  // Expose refresh functions globally for other components to use
  useEffect(() => {
    // Store refresh functions on window object for global access
    (window as any).dashboardRefresh = {
      refreshProfile: refreshProfileData,
      refreshAll: refreshAllDashboardData
    };

    // Cleanup on unmount
    return () => {
      delete (window as any).dashboardRefresh;
    };
  }, []);

  // Function to refresh profile data (can be called after profile updates)
  const refreshProfileData = async () => {
    try {
      console.log('🔄 Dashboard - Refreshing profile data...');
      setProfileLoading(true);
      const updatedProfile = await getCurrentUserProfile();
      setProfileData(updatedProfile);
      // Don't call refreshUserData here to avoid triggering useEffect loop
      console.log('✅ Dashboard - Profile data refreshed successfully');
    } catch (error) {
      console.error('❌ Dashboard - Error refreshing profile data:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Function to refresh all dashboard data
  const refreshAllDashboardData = async () => {
    try {
      console.log('🔄 Dashboard - Refreshing all dashboard data...');
      setStatsLoading(true);
      setDataLoading(true);
      setProfileLoading(true);

      // Fetch all data in parallel
      const [
        stats,
        profile,
        sessions,
        recommended,
        teaching,
        learning
      ] = await Promise.allSettled([
        getDashboardStats(),
        getCurrentUserProfile(),
        getUpcomingSessions(),
        getRecommendedUsers(),
        getUserTeachingSkills(),
        getUserLearningSkills()
      ]);

      // Update all state
      if (stats.status === 'fulfilled') {
        setDashboardStats(stats.value);
      }
      if (profile.status === 'fulfilled') {
        setProfileData(profile.value);
        await refreshUserData();
      }
      if (sessions.status === 'fulfilled') {
        setUpcomingSessions(sessions.value);
      }
      if (recommended.status === 'fulfilled') {
        setRecommendedUsers(recommended.value);
      }
      if (teaching.status === 'fulfilled') {
        const teachingData = teaching.value?.results || teaching.value || [];
        setTeachingSkills(teachingData);
      }
      if (learning.status === 'fulfilled') {
        const learningData = learning.value?.results || learning.value || [];
        setLearningSkills(learningData);
      }

      console.log('✅ Dashboard - All data refreshed successfully');
    } catch (error) {
      console.error('❌ Dashboard - Error refreshing dashboard data:', error);
    } finally {
      setStatsLoading(false);
      setDataLoading(false);
      setProfileLoading(false);
    }
  };

  // Show loading state while fetching data (authentication is handled by ProtectedRoute)
  if (statsLoading || dataLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading Your Dashboard</h3>
          <p className="text-muted-foreground">Fetching your latest data from the backend...</p>
        </div>
      </div>
    );
  }

  // Helper function to process skills and ensure unique names
  const processSkills = (skills: any[], type: 'teaching' | 'learning') => {
    if (!Array.isArray(skills)) return [];

    return skills.map((skill, index) => {
      // Handle different skill data structures
      let skillName = '';
      
      if (typeof skill === 'string') {
        skillName = skill;
      } else if (skill && typeof skill === 'object') {
        skillName = skill.skill?.name || skill.name || skill.title || '';
      }
      
      if (skillName && skillName.trim()) {
        return skillName.trim();
      }
      // Generate unique fallback name
      return `${type === 'teaching' ? 'Teaching' : 'Learning'} Skill ${index + 1}`;
    }).filter((name, index, array) => {
      // Remove duplicates and empty strings while preserving order
      return name && array.indexOf(name) === index;
    });
  };

  // Create user object with real data from profile and dashboard stats
  const user = (() => {
    // Priority 1: Use profile data if available (most up-to-date)
    if (profileData) {
      const avatarUrl = profileData.avatar ? addCacheBusting(profileData.avatar) : null;
      const fallbackAvatar = `https://i.pravatar.cc/150?u=${profileData.id}`;

      return {
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || profileData.email,
        avatar: avatarUrl || fallbackAvatar,
        level: profileData.profile?.level || 1,
        points: profileData.profile?.points || 0,
        nextLevelPoints: profileData.profile?.next_level_points || 1000,
        memberSince: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently joined',
        stats: {
          sessionsCompleted: profileData.profile?.sessions_completed || 0,
          skillsShared: dashboardStats?.skills?.teaching_count || 0,
          skillsLearned: dashboardStats?.skills?.learning_count || 0,
          hoursExchanged: dashboardStats?.activity?.hours_exchanged || 0,
          averageRating: profileData.profile?.average_rating || 0
        },
        badges: [], // TODO: Calculate based on achievements
        teachSkills: processSkills(teachingSkills, 'teaching'),
        learnSkills: processSkills(learningSkills, 'learning')
      };
    }

    // Priority 2: Use dashboard stats if available
    if (dashboardStats) {
      const avatarUrl = dashboardStats.user.avatar ? addCacheBusting(dashboardStats.user.avatar) : null;
      const fallbackAvatar = `https://i.pravatar.cc/150?u=${dashboardStats.user.id}`;

      return {
        name: `${dashboardStats.user.first_name} ${dashboardStats.user.last_name}`,
        avatar: avatarUrl || fallbackAvatar,
        level: dashboardStats.profile.level,
        points: dashboardStats.profile.points,
        nextLevelPoints: dashboardStats.profile.next_level_points,
        memberSince: dashboardStats.user.member_since,
        stats: {
          sessionsCompleted: dashboardStats.profile.sessions_completed,
          skillsShared: dashboardStats.skills.teaching_count,
          skillsLearned: dashboardStats.skills.learning_count,
          hoursExchanged: dashboardStats.activity.hours_exchanged,
          averageRating: dashboardStats.profile.average_rating
        },
        badges: [], // TODO: Calculate based on achievements
        teachSkills: processSkills(teachingSkills, 'teaching'),
        learnSkills: processSkills(learningSkills, 'learning')
      };
    }

    // Priority 3: Use auth context data
    if (authUser) {
      const avatarUrl = authUser.avatar ? addCacheBusting(authUser.avatar) : null;
      const fallbackAvatar = `https://i.pravatar.cc/150?u=${authUser.id}`;

      return {
        name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || authUser.email,
        avatar: avatarUrl || fallbackAvatar,
        level: 1,
        points: 0,
        nextLevelPoints: 1000,
        memberSince: "Recently joined",
        stats: {
          sessionsCompleted: 0,
          skillsShared: 0,
          skillsLearned: 0,
          hoursExchanged: 0,
          averageRating: 0
        },
        badges: [],
        teachSkills: [],
        learnSkills: []
      };
    }

    // Priority 4: Fallback to mock data
    return mockUser;
  })();

  const unreadNotifications = notifications.filter(n => !n.read).length;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
              <p className="text-muted-foreground">Member since {user.memberSince}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Link to="/profile/edit">
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>



        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Level</p>
                  <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold">{user.level}</h3>
                    <span className="text-xs text-muted-foreground ml-1">/ 10</span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{user.points} points</span>
                  <span>{user.nextLevelPoints} points</span>
                </div>
                <Progress value={(user.points / user.nextLevelPoints) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {user.nextLevelPoints - user.points} points to Level {user.level + 1}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sessions</p>
                  <h3 className="text-2xl font-bold">{user.stats.sessionsCompleted}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Skills Shared</p>
                  <p className="font-medium">{user.stats.skillsShared}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Skills Learned</p>
                  <p className="font-medium">{user.stats.skillsLearned}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hours</p>
                  <p className="font-medium">{user.stats.hoursExchanged}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <div className="flex items-baseline">
                    <h3 className="text-2xl font-bold">{user.stats.averageRating}</h3>
                    <span className="text-xs text-muted-foreground ml-1">/ 5</span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill={star <= Math.floor(user.stats.averageRating) ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-500 mr-1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
                <span className="text-xs text-muted-foreground ml-auto">
                  Based on {user.stats.sessionsCompleted} sessions
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Badges</p>
                  <h3 className="text-2xl font-bold">{user.badges ? user.badges.length : 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {user.badges && user.badges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {badge.icon === "award" && <Award className="h-4 w-4" />}
                      {badge.icon === "zap" && <Zap className="h-4 w-4" />}
                      {badge.icon === "star" && <Star className="h-4 w-4" />}
                    </div>
                    <span className="text-xs mt-1">{badge.name}</span>
                  </div>
                ))}
                <Link to="/badges" className="flex items-center ml-auto">
                  <span className="text-xs text-primary">View all</span>
                  <ChevronRight className="h-3 w-3 text-primary" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Sessions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <Link to="/sessions">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View all
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  Your scheduled skill swap sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingSessions && upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map(session => (
                      <div key={session.id} className="flex items-start p-3 rounded-lg hover:bg-muted/50">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={session.user?.avatar || `https://i.pravatar.cc/150?u=${session.user?.id || session.id}`} />
                          <AvatarFallback>{session.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{session.skill} with {session.user?.name || 'Unknown User'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {session.date} • {session.time} • {session.type}
                              </p>
                            </div>
                            <Link to={`/sessions/${session.id}`}>
                              <Button variant="outline" size="sm">Details</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No upcoming sessions</p>
                    <Link to="/explore">
                      <Button variant="link" className="mt-2">Find members to swap with</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Skills Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Skills Overview</CardTitle>
                <CardDescription>
                  Your teaching and learning progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="teaching">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="teaching">Teaching</TabsTrigger>
                    <TabsTrigger value="learning">Learning</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="teaching">
                    <div className="space-y-4">
                      {user.teachSkills && user.teachSkills.length > 0 ? user.teachSkills.map((skill: any, index: number) => (
                        <div key={`teach-skill-${index}-${typeof skill === 'string' ? skill : skill.name || skill.id || 'unknown'}`} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{typeof skill === 'string' ? skill : skill.name}</h3>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-sm">{typeof skill === 'string' ? '5.0' : skill.rating}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                ({typeof skill === 'string' ? '0' : skill.sessions} sessions)
                              </span>
                            </div>
                          </div>
                          <Progress value={typeof skill === 'string' ? 0 : (skill.sessions / 20) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Expert</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No skills added yet</p>
                          <Link to="/profile/edit">
                            <Button variant="link" className="mt-2">Add your first skill</Button>
                          </Link>
                        </div>
                      )}
                      
                      <div className="pt-4 text-center">
                        <Link to="/profile/edit">
                          <Button variant="outline" size="sm">
                            Add More Skills
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="learning">
                    <div className="space-y-4">
                      {user.learnSkills && user.learnSkills.length > 0 ? user.learnSkills.map((skill: any, index: number) => (
                        <div key={`learn-skill-${index}-${typeof skill === 'string' ? skill : skill.name || skill.id || 'unknown'}`} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{typeof skill === 'string' ? skill : skill.name}</h3>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 text-primary mr-1" />
                              <span className="text-xs text-muted-foreground">
                                {typeof skill === 'string' ? '0' : skill.sessions} sessions completed
                              </span>
                            </div>
                          </div>
                          <Progress value={typeof skill === 'string' ? 0 : (skill.sessions / 10) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Advanced</span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No learning goals set yet</p>
                          <Link to="/profile/edit">
                            <Button variant="link" className="mt-2">Add learning goals</Button>
                          </Link>
                        </div>
                      )}
                      
                      <div className="pt-4 text-center">
                        <Link to="/profile/edit">
                          <Button variant="outline" size="sm">
                            Add Learning Goals
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Notifications */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    Notifications
                    {unreadNotifications > 0 && (
                      <Badge className="ml-2">{unreadNotifications}</Badge>
                    )}
                  </CardTitle>
                  <Button variant="ghost" size="sm">Mark all read</Button>
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-1">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg ${notification.read ? '' : 'bg-muted/50'} hover:bg-muted`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.user ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={notification.user.avatar || `https://i.pravatar.cc/150?u=${notification.user.id || notification.id}`} />
                              <AvatarFallback>{notification.user.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bell className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              {notification.user && (
                                <span className="font-medium">{notification.user.name || 'Unknown User'} </span>
                              )}
                              {notification.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Link to="/notifications" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Recommended Users */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>
                  Members who match your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedUsers && recommendedUsers.length > 0 ? recommendedUsers.map(user => (
                    <div key={user.id} className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} />
                        <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{user.name || 'Unknown User'}</h3>
                          <Badge variant="outline" className="text-xs">
                            {user.match}% match
                          </Badge>
                        </div>
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground">Teaches:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.teachSkills && user.teachSkills.length > 0 ? (
                              <>
                                {user.teachSkills.slice(0, 2).map((skill, i) => (
                                  <Badge key={`badge-teach-${i}-${skill}`} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {user.teachSkills.length > 2 && (
                                  <span className="text-xs text-muted-foreground">+{user.teachSkills.length - 2} more</span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">No skills listed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No recommended users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link to="/explore" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Explore More Members
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Voice AI Interface */}
      <VoiceInterface
        userId={Number(authUser?.id) || 0}
        features={['skill_discovery', 'availability_check', 'session_booking', 'session_management']}
      />
    </div>
  );
};

export default Dashboard;
