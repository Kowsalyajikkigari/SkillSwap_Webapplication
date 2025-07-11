import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Trophy, MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { addCacheBusting } from "../../../services/profiles";
import VideoChat from "../../sessions/VideoChat";
import { User, Skill } from "@/types";
import SkillPoints from "../../gamification/SkillPoints";
import SkillRecommendations from "../../recommendations/SkillRecommendations";
import { PointsActivity } from "../../gamification/SkillPoints";
import { useAuth } from "../../../contexts/AuthContext";

interface SessionRequest {
  id: string;
  teacherId: number;
  studentId: number;
  skillId: number;
  skill: string;
  message: string;
  status: string;
  scheduledDate?: Date;
}

interface OverviewTabProps {
  skillPointsData: {
    totalPoints: number;
    level: number;
    nextLevelPoints: number;
    recentActivities: PointsActivity[];
  };
  recommendedTeachSkills: Skill[];
  recommendedLearnSkills: Skill[];
  activeSessionId: string | null;
  setActiveSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  handleAddSkill: (skill: Skill, type: 'teach' | 'learn') => void;
  pendingRequests: SessionRequest[];
  upcomingSessions: SessionRequest[];
  studentRequests: SessionRequest[];
  badges: Array<{ id: number; name: string; icon: string; description: string }>;

  users: User[];
  handleJoinSession: (sessionId: string, url: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  skillPointsData,
  recommendedTeachSkills,
  recommendedLearnSkills,
  activeSessionId,
  setActiveSessionId,
  handleAddSkill,
  pendingRequests,
  upcomingSessions,
  studentRequests,
  badges,
  users,
  handleJoinSession
}) => {
  const { user: authUser } = useAuth();
  if (!authUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }
  // Use real user data from auth context
  const currentUser = {
    ...authUser,
    name: `${authUser.first_name} ${authUser.last_name}`,
    rating: authUser.rating,
    sessionsCompleted: authUser.sessionsCompleted,
    teachSkills: authUser.teachSkills?.map(ts => ({ id: ts.skill, name: ts.skill_name })) || [],
    learnSkills: authUser.learnSkills?.map(ls => ({ id: ls.skill, name: ls.skill_name })) || [],
  };
  // Helper to get user by id (number)
  const getUserById = (id: number) => {
    const user = users.find(u => u.id === id);
    if (!user) return undefined;
    return {
      ...user,
      name: `${user.first_name} ${user.last_name}`,
      rating: user.rating,
      sessionsCompleted: user.sessionsCompleted,
      teachSkills: user.teachSkills?.map(ts => ({ id: ts.skill, name: ts.skill_name })) || [],
      learnSkills: user.learnSkills?.map(ls => ({ id: ls.skill, name: ls.skill_name })) || [],
    };
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/3">
        <div className="space-y-6">
          <ProfileCard user={currentUser} />
          <SkillPoints 
            totalPoints={skillPointsData.totalPoints}
            level={skillPointsData.level}
            nextLevelPoints={skillPointsData.nextLevelPoints}
            recentActivities={skillPointsData.recentActivities}
          />
          <BadgesCard badges={badges} />
          <SkillRecommendations
            recommendedTeachSkills={recommendedTeachSkills}
            recommendedLearnSkills={recommendedLearnSkills}
            onAddSkill={handleAddSkill}
          />
        </div>
      </div>
      <div className="md:w-2/3 space-y-6">
        <SessionRequestsCard pendingRequests={pendingRequests} getUserById={getUserById} />
        <UpcomingSessionsCard 
          upcomingSessions={upcomingSessions} 
          getUserById={getUserById}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          handleJoinSession={handleJoinSession}
        />
        <LearningRequestsCard studentRequests={studentRequests} getUserById={getUserById} />
      </div>
    </div>
  );
};

interface ProfileUser {
  id: number;
  name: string;
  avatar?: string;
  location?: string;
  bio?: string;
  rating?: number;
  sessionsCompleted?: number;
  teachSkills?: Array<{ id: string; name: string }>;
  learnSkills?: Array<{ id: string; name: string }>;
  availability?: string[];
}

interface ProfileCardProps {
  user: ProfileUser;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>My Profile</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={addCacheBusting(user.avatar)} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold">{user.name}</h3>
        <p className="text-muted-foreground mb-2">{user.location}</p>
        <p className="text-sm mb-4">{user.bio}</p>
        
        <div className="flex items-center mb-4">
          <Star className="w-4 h-4 text-yellow-500 mr-1" />
          <span className="font-medium">{user.rating}</span>
          <span className="text-muted-foreground ml-2">({user.sessionsCompleted} sessions)</span>
        </div>
        
        <Link to="/profile">
          <Button variant="outline" size="sm">Edit Profile</Button>
        </Link>
      </div>
      
      <div className="mt-6 space-y-4">
        <div>
          <h4 className="font-medium mb-2">Skills I Teach</h4>
          <div className="flex flex-wrap gap-2">
            {user.teachSkills && user.teachSkills.map((skill) => (
              <div key={skill.id} className="skill-badge-teach">
                {skill.name}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Skills I Want to Learn</h4>
          <div className="flex flex-wrap gap-2">
            {user.learnSkills && user.learnSkills.map((skill) => (
              <div key={skill.id} className="skill-badge-learn">
                {skill.name}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Availability</h4>
          <div className="text-sm">
            {user.availability && user.availability.length > 0 ? (
              user.availability.map((time, index) => (
                <div key={index} className="flex items-center mb-1">
                  <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span>{time}</span>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No availability set</div>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface BadgesCardProps {
  badges: Array<{ id: number; name: string; icon: string; description: string }>;
}

const BadgesCard: React.FC<BadgesCardProps> = ({ badges }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>My Badges</CardTitle>
      <CardDescription>Achievements you've earned</CardDescription>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="grid grid-cols-2 gap-4">
        {badges.slice(0, 4).map((badge) => (
          <div key={badge.id} className="flex flex-col items-center p-3 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              {badge.icon === "trophy" && <Trophy className="h-6 w-6 text-primary" />}
              {badge.icon === "star" && <Star className="h-6 w-6 text-primary" />}
              {badge.icon === "award" && <Trophy className="h-6 w-6 text-primary" />}
              {badge.icon === "user" && <Trophy className="h-6 w-6 text-primary" />}
            </div>
            <span className="text-sm font-medium text-center">{badge.name}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

interface SessionRequestsCardProps {
  pendingRequests: SessionRequest[];
  getUserById: (id: number) => User | undefined;
}

const SessionRequestsCard: React.FC<SessionRequestsCardProps> = ({ pendingRequests, getUserById }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>Session Requests</CardTitle>
      <CardDescription>People who want to learn from you</CardDescription>
    </CardHeader>
    <CardContent>
      {pendingRequests.length > 0 ? (
        <div className="space-y-4">
          {pendingRequests.map((request) => {
            const student = getUserById(request.studentId);
            return (
              <div key={request.id} className="flex items-start p-4 border rounded-lg">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={student?.avatar} alt={student?.name} />
                  <AvatarFallback>{student?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{student?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Wants to learn: <span className="text-primary font-medium">
                          {request.skill}
                        </span>
                      </p>
                      <p className="text-sm mt-2">{request.message}</p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="default">Accept</Button>
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm" variant="ghost">Message</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No pending requests at the moment.</p>
        </div>
      )}
    </CardContent>
  </Card>
);

interface UpcomingSessionsCardProps {
  upcomingSessions: SessionRequest[];
  getUserById: (id: number) => User | undefined;
  activeSessionId: string | null;
  setActiveSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  handleJoinSession: (sessionId: string, url: string) => void;
}

const UpcomingSessionsCard: React.FC<UpcomingSessionsCardProps> = ({ 
  upcomingSessions, 
  getUserById,
  activeSessionId,
  setActiveSessionId,
  handleJoinSession
}) => {
  const { user: authUser } = useAuth();
  const currentUser = authUser ? {
    id: authUser.id,
    name: `${authUser.firstName} ${authUser.lastName}`,
  } : { id: "", name: "" };
  
  return (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>Upcoming Sessions</CardTitle>
      <CardDescription>Your scheduled skill swap sessions</CardDescription>
    </CardHeader>
    <CardContent>
      {upcomingSessions.length > 0 ? (
        <div className="space-y-4">
          {upcomingSessions.map((session) => {
            const isTeaching = session.teacherId === currentUser.id;
            const otherPerson = getUserById(isTeaching ? session.studentId : session.teacherId);
            return (
              <div key={session.id} className="flex items-start p-4 border rounded-lg">
                <div className="mr-4 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {session.scheduledDate?.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {isTeaching ? `Teaching ${otherPerson?.name}` : `Learning from ${otherPerson?.name}`}
                      </p>
                      <p className="text-sm">
                        <span className={isTeaching ? "text-skill-teach font-medium" : "text-skill-learn font-medium"}>
                          {session.skill}
                        </span>
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Scheduled</Badge>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="gap-2"
                      onClick={() => setActiveSessionId(session.id)}
                    >
                      Start Video Session
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">Cancel</Button>
                  </div>
                  
                  {activeSessionId === session.id && (
                    <div className="mt-4">
                      <VideoChat 
                        sessionId={session.id} 
                        onJoinSession={(url) => handleJoinSession(session.id, url)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No upcoming sessions.</p>
          <Button variant="outline" className="mt-4">Find skills to learn</Button>
        </div>
      )}
    </CardContent>
  </Card>
  );
};

interface LearningRequestsCardProps {
  studentRequests: SessionRequest[];
  getUserById: (id: number) => User | undefined;
}

const LearningRequestsCard: React.FC<LearningRequestsCardProps> = ({ studentRequests, getUserById }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle>My Learning Requests</CardTitle>
      <CardDescription>Requests you've sent to learn from others</CardDescription>
    </CardHeader>
    <CardContent>
      {studentRequests.length > 0 ? (
        <div className="space-y-4">
          {studentRequests.map((request) => {
            const teacher = getUserById(request.teacherId);
            return (
              <div key={request.id} className="flex items-start p-4 border rounded-lg">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={teacher?.avatar} alt={teacher?.name} />
                  <AvatarFallback>{teacher?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Learning from {teacher?.name}</p>
                      <p className="text-sm">
                        Skill: <span className="text-skill-learn font-medium">
                          {users.find(u => u.id === teacher?.id)?.teachSkills.find(skill => skill.id === request.skillId)?.name}
                        </span>
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        request.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        request.status === "accepted" ? "bg-green-50 text-green-700 border-green-200" : 
                        request.status === "completed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    {request.status === "pending" ? (
                      <>
                        <Button size="sm" variant="ghost">Edit Request</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">Cancel</Button>
                      </>
                    ) : request.status === "accepted" ? (
                      <>
                        <Button size="sm" variant="default" className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </Button>
                        <Button size="sm" variant="outline">View Details</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline">View Details</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You haven't sent any learning requests yet.</p>
          <Button variant="outline" className="mt-4">Find skills to learn</Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default OverviewTab;
