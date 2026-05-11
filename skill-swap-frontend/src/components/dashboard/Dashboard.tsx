import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import MatchesTab from "./tabs/MatchesTab";
import ChallengesTab from "./tabs/ChallengesTab";
import CommunityTab from "./tabs/CommunityTab";
import ProgressTab from "./tabs/ProgressTab";
import { getCurrentUserProfile, getAllProfiles } from "../../services/profiles";
import {
  getDashboardStats,
  getUpcomingSessions,
  getRecommendedUsers,
  getUserTeachingSkills,
  getUserLearningSkills,
  DashboardStats as ServiceDashboardStats,
  DashboardUser
} from "../../services/dashboard.service";
import { useAuth } from "../../contexts/AuthContext";
import { avatarSyncService } from "../../services/avatar-sync.service";

// Types
interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  teachSkills?: any[];
  learnSkills?: any[];
}

interface Session {
  id: string;
  title: string;
  date: string;
  time: string;
  teacher: User;
  student: User;
  skill: string;
  status: string;
  meetingUrl?: string;
}

interface SkillRequest {
  id: string;
  requester: User;
  skill: string;
  message: string;
  status: string;
  createdAt: string;
}

const Dashboard = () => {
  const { user, refreshUserData } = useAuth();

  // State
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<ServiceDashboardStats | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<SkillRequest[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [studentRequests, setStudentRequests] = useState<SkillRequest[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<any[]>([]);
  const [learningSkills, setLearningSkills] = useState<any[]>([]);
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [skillProgressData, setSkillProgressData] = useState<any>({});

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Dashboard - Fetching dashboard data...');

      // Fetch all data in parallel
      const [
        stats,
        profile,
        allProfiles,
        sessions,
        recommended,
        teaching,
        learning
      ] = await Promise.allSettled([
        getDashboardStats(),
        getCurrentUserProfile(),
        getAllProfiles(),
        getUpcomingSessions(),
        getRecommendedUsers(),
        getUserTeachingSkills(),
        getUserLearningSkills()
      ]);

      // Update state with successful results
      if (stats.status === 'fulfilled') {
        setDashboardStats(stats.value as ServiceDashboardStats);
      }
      if (profile.status === 'fulfilled') {
        setCurrentUser(profile.value as User);
      }
      if (allProfiles.status === 'fulfilled') {
        const profilesData = allProfiles.value;
        // Ensure we always set an array
        if (Array.isArray(profilesData)) {
          setUsers(profilesData as User[]);
        } else {
          console.warn('getAllProfiles returned non-array data:', profilesData);
          setUsers([]);
        }
      }
      if (sessions.status === 'fulfilled') {
        const sessionsData = sessions.value;
        if (Array.isArray(sessionsData)) {
          setUpcomingSessions(sessionsData as Session[]);
        } else {
          console.warn('getUpcomingSessions returned non-array data:', sessionsData);
          setUpcomingSessions([]);
        }
      }
      if (recommended.status === 'fulfilled') {
        const recommendedData = recommended.value;
        if (Array.isArray(recommendedData)) {
          setRecommendedUsers(recommendedData as User[]);
        } else {
          console.warn('getRecommendedUsers returned non-array data:', recommendedData);
          setRecommendedUsers([]);
        }
      }
      if (teaching.status === 'fulfilled') {
        const teachingData = (teaching.value as any)?.results || teaching.value || [];
        setTeachingSkills(teachingData);
      }
      if (learning.status === 'fulfilled') {
        const learningData = (learning.value as any)?.results || learning.value || [];
        setLearningSkills(learningData);
      }

      console.log('✅ Dashboard - Data fetched successfully');
    } catch (err: any) {
      console.error('❌ Dashboard - Error fetching data:', err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Function to refresh profile data (can be called after profile updates)
  const refreshProfileData = async () => {
    try {
      console.log('🔄 Dashboard - Refreshing profile data...');
      setProfileLoading(true);
      const updatedProfile = await getCurrentUserProfile();
      setCurrentUser(updatedProfile);
      await refreshUserData();
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
      await fetchDashboardData();
    } catch (error) {
      console.error('❌ Dashboard - Error refreshing dashboard data:', error);
    }
  };

  // Listen for avatar updates and refresh profile data
  useEffect(() => {
    const unsubscribe = avatarSyncService.subscribe((_newAvatarUrl) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
      </div>
    );
  }

  // Filter users for potential teachers/students (ensure users is an array)
  const potentialTeachers = Array.isArray(users) ? users.filter(u => u.teachSkills && u.teachSkills.length > 0) : [];
  const potentialStudents = Array.isArray(users) ? users.filter(u => u.learnSkills && u.learnSkills.length > 0) : [];

  // Helper to get user by id (number)
  const getUserById = (id: number) => Array.isArray(users) ? users.find(u => u.id === id) : undefined;
  // Handler for joining a session
  const handleJoinSession = (sessionId: string, _url: string) => {
    setActiveSessionId(sessionId);
    // TODO: Implement real join session logic
  };
  // Handler for adding a skill
  const handleAddSkill = (_skill: any, _type: 'teach' | 'learn') => {
    // TODO: Implement real skill add logic
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in-custom">
      <Tabs defaultValue="overview" className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview">
          <OverviewTab
            skillPointsData={{
              totalPoints: dashboardStats?.profile?.points || 0,
              level: dashboardStats?.profile?.level || 1,
              nextLevelPoints: dashboardStats?.profile?.next_level_points || 100,
              recentActivities: []
            }}
            recommendedTeachSkills={Array.isArray(teachingSkills) ? teachingSkills.map(skill => ({
              id: skill.id || skill.skill?.id || Math.random().toString(),
              name: skill.skill?.name || skill.name || 'Unknown Skill',
              category: skill.skill?.category || skill.category || 'General',
              description: skill.skill?.description || skill.description,
              level: skill.skill?.level || skill.level
            })) : []}
            recommendedLearnSkills={Array.isArray(learningSkills) ? learningSkills.map(skill => ({
              id: skill.id || skill.skill?.id || Math.random().toString(),
              name: skill.skill?.name || skill.name || 'Unknown Skill',
              category: skill.skill?.category || skill.category || 'General',
              description: skill.skill?.description || skill.description,
              level: skill.skill?.level || skill.level
            })) : []}
            activeSessionId={activeSessionId}
            setActiveSessionId={setActiveSessionId}
            handleAddSkill={handleAddSkill}
            pendingRequests={[]}
            upcomingSessions={[]}
            studentRequests={[]}
            badges={badges}
            users={users as any}
            handleJoinSession={handleJoinSession}
          />
        </TabsContent>
        <TabsContent value="matches">
          {currentUser && (
            <MatchesTab
              currentUser={currentUser as any}
              potentialTeachers={potentialTeachers as any}
              potentialStudents={potentialStudents as any}
            />
          )}
        </TabsContent>
        <TabsContent value="challenges">
          <ChallengesTab
            challenges={challenges}
            recommendedUsers={potentialTeachers.slice(0, 6) as any}
          />
        </TabsContent>
        <TabsContent value="community">
          <CommunityTab
            userId={String(currentUser?.id || "")}
            userName={currentUser?.first_name ? `${currentUser.first_name} ${currentUser.last_name}` : currentUser?.email || ""}
            userAvatar={currentUser?.avatar || ""}
            forumPosts={forumPosts}
            reviews={reviews}
          />
        </TabsContent>
        <TabsContent value="progress">
          <ProgressTab skillProgressData={skillProgressData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
