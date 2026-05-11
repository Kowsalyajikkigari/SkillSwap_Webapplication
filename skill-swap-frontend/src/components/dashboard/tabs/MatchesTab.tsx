
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MatchingEngine from "../../matching/MatchingEngine";
import { User } from "@/types";
import { getSkillMatches, getSkillExchangeRequests, SkillMatch, SkillExchangeRequest } from "../../../services/skill-exchange.service";
import { Users, BookOpen, MessageSquare, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";

interface MatchesTabProps {
  currentUser: User;
  potentialTeachers: User[];
  potentialStudents: User[];
}

const MatchesTab: React.FC<MatchesTabProps> = ({
  currentUser,
  potentialTeachers,
  potentialStudents
}) => {
  const [skillMatches, setSkillMatches] = useState<SkillMatch[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<SkillExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("discover");

  useEffect(() => {
    loadMatchesData();
  }, []);

  const loadMatchesData = async () => {
    setLoading(true);
    try {
      const [matches, requests] = await Promise.all([
        getSkillMatches({ limit: 20 }),
        getSkillExchangeRequests()
      ]);

      setSkillMatches(matches);
      setExchangeRequests(requests);
    } catch (error) {
      console.error('Error loading matches data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert SkillMatch to User format for MatchingEngine compatibility
  const convertMatchesToUsers = (matches: SkillMatch[], isTeaching: boolean): User[] => {
    return matches.map(match => ({
      id: match.user.id,
      email: match.user.email,
      first_name: match.user.first_name,
      last_name: match.user.last_name,
      avatar: match.user.avatar,
      location: match.user.location,
      bio: match.user.bio,
      rating: match.user.rating,
      sessionsCompleted: match.user.sessions_completed,
      teachSkills: isTeaching ? match.matching_skills.map(skill => ({
        id: skill.id.toString(),
        name: skill.name,
        category: skill.category,
        level: skill.level as any
      })) : [],
      learnSkills: !isTeaching ? match.matching_skills.map(skill => ({
        id: skill.id.toString(),
        name: skill.name,
        category: skill.category,
        level: skill.level as any
      })) : [],
      availability: [],
      date_joined: new Date().toISOString(),
    }));
  };

  const teacherMatches = convertMatchesToUsers(skillMatches, true);
  const studentMatches = convertMatchesToUsers(skillMatches, false);

  const pendingRequests = exchangeRequests.filter(req => req.status === 'pending');
  const acceptedRequests = exchangeRequests.filter(req => req.status === 'accepted');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Skill Matches</h2>
          <p className="text-muted-foreground">Discover and connect with skill exchange partners</p>
        </div>
        <Button onClick={loadMatchesData} disabled={loading}>
          {loading ? "Loading..." : "Refresh Matches"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">
            Discover
            {skillMatches.length > 0 && (
              <Badge className="ml-2">{skillMatches.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests">
            My Requests
            {pendingRequests.length > 0 && (
              <Badge className="ml-2">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted
            {acceptedRequests.length > 0 && (
              <Badge className="ml-2">{acceptedRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="teaching">Teaching</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Find Teachers
              </h3>
              <MatchingEngine
                currentUser={currentUser}
                potentialMatches={teacherMatches.length > 0 ? teacherMatches : potentialTeachers}
                learnMode={true}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Find Students
              </h3>
              <MatchingEngine
                currentUser={currentUser}
                potentialMatches={studentMatches.length > 0 ? studentMatches : potentialStudents}
                learnMode={false}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <RequestsList
            requests={pendingRequests}
            title="Pending Requests"
            emptyMessage="No pending requests at the moment."
            onRefresh={loadMatchesData}
          />
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          <RequestsList
            requests={acceptedRequests}
            title="Accepted Requests"
            emptyMessage="No accepted requests yet."
            onRefresh={loadMatchesData}
          />
        </TabsContent>

        <TabsContent value="teaching" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Opportunities</CardTitle>
              <CardDescription>Students who want to learn from you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-lg">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Teaching opportunities will be available here soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface RequestsListProps {
  requests: SkillExchangeRequest[];
  title: string;
  emptyMessage: string;
  onRefresh: () => void;
}

const RequestsList: React.FC<RequestsListProps> = ({ requests, title, emptyMessage, onRefresh }) => {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg">No Requests</h3>
            <p className="text-muted-foreground mb-4">{emptyMessage}</p>
            <Button onClick={onRefresh}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map(request => (
            <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {request.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                  {request.status === 'accepted' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {request.status === 'declined' && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
                <div>
                  <h4 className="font-semibold">
                    {request.skill.name} with {request.provider.first_name} {request.provider.last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{request.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sent {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchesTab;
