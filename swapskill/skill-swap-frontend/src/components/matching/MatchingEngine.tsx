
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users, Sparkles, Star, Search, Filter, MessageSquare, Calendar, MapPin, Clock } from "lucide-react";
import { User, Skill } from "@/types";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface MatchingEngineProps {
  currentUser: User;
  potentialMatches: User[];
  learnMode?: boolean;
}

const MatchingEngine = ({
  currentUser,
  potentialMatches,
  learnMode = true
}: MatchingEngineProps) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSkillForRequest, setSelectedSkillForRequest] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRefresh = () => {
    setRefreshing(true);
    // In a real app, this would call an API to get new matches
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const matchText = learnMode
    ? "Find teachers who can help you learn"
    : "Find students who want to learn from you";

  const skillsToMatch = learnMode ? currentUser.learnSkills : currentUser.teachSkills;
  
  // Filter matches based on search and filters
  const filteredMatches = potentialMatches.filter(match => {
    const matchesSearch = searchQuery === "" ||
      match.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill = skillFilter === "all" ||
      (learnMode ? match.teachSkills : match.learnSkills)?.some(skill =>
        skill.name.toLowerCase().includes(skillFilter.toLowerCase())
      );

    const matchesLocation = locationFilter === "all" ||
      match.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesSkill && matchesLocation;
  });

  // Get unique skills for filter dropdown
  const availableSkills = Array.from(new Set(
    potentialMatches.flatMap(match =>
      (learnMode ? match.teachSkills : match.learnSkills)?.map(skill => skill.name) || []
    )
  ));

  // Get unique locations for filter dropdown
  const availableLocations = Array.from(new Set(
    potentialMatches.map(match => match.location).filter(Boolean)
  ));

  const handleSendRequest = async () => {
    if (!selectedUser || !selectedSkillForRequest) {
      toast({
        title: "Missing Information",
        description: "Please select a skill and provide a message.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call - in real app, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Request Sent!",
        description: `Your skill exchange request has been sent to ${selectedUser.first_name} ${selectedUser.last_name}.`,
      });

      setRequestDialogOpen(false);
      setRequestMessage("");
      setSelectedSkillForRequest("");
      setSelectedUser(null);

      // Navigate to sessions page to see the request
      navigate("/sessions");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Matching Engine
            </CardTitle>
            <CardDescription>{matchText}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh Matches"}
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {availableSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {availableLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 items-center">
              {skillsToMatch?.map((skill) => (
                <Badge
                  key={skill.id}
                  variant="outline"
                  className={`
                    whitespace-nowrap
                    ${learnMode ? 'bg-skill-learn/10 text-skill-learn border-skill-learn/20' :
                    'bg-skill-teach/10 text-skill-teach border-skill-teach/20'}
                  `}
                >
                  {skill.name}
                </Badge>
              ))}
            </div>

            <div className="text-sm text-muted-foreground mb-4">
              Showing {filteredMatches.length} of {potentialMatches.length} matches
            </div>

            <div className="divide-y">
              {filteredMatches.map((match) => (
                <div key={match.id} className="py-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={match.avatar} alt={`${match.first_name} ${match.last_name}`} />
                        <AvatarFallback>{match.first_name?.charAt(0)}{match.last_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{match.first_name} {match.last_name}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{match.rating || 4.5}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{match.location || "Location not set"}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{match.sessionsCompleted || 0} sessions</span>
                          </div>
                        </div>
                        {match.bio && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{match.bio}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(match);
                          setRequestDialogOpen(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send Request
                      </Button>
                      <Link to={`/profile/${match.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h5 className="font-medium text-sm mb-2">
                        {learnMode ? "Can teach:" : "Wants to learn:"}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {(learnMode ? match.teachSkills : match.learnSkills)?.slice(0, 5).map((skill) => (
                          <Badge
                            key={skill.id}
                            variant="secondary"
                            className={`text-xs ${learnMode ? 'bg-skill-teach/10 text-skill-teach' : 'bg-skill-learn/10 text-skill-learn'}`}
                          >
                            {skill.name}
                          </Badge>
                        ))}
                        {((learnMode ? match.teachSkills : match.learnSkills)?.length || 0) > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{((learnMode ? match.teachSkills : match.learnSkills)?.length || 0) - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg">No matches found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || skillFilter !== "all" || locationFilter !== "all"
                ? "Try adjusting your search filters to find more matches."
                : "We couldn't find any matches based on your skills. Try refreshing or updating your profile."
              }
            </p>
            <div className="flex gap-2 justify-center">
              {(searchQuery || skillFilter !== "all" || locationFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSkillFilter("all");
                    setLocationFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <Button onClick={handleRefresh}>Refresh Matches</Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Skill Exchange Request</DialogTitle>
            <DialogDescription>
              Send a request to {selectedUser?.first_name} {selectedUser?.last_name} for a skill exchange session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedUser && (
              <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.avatar} alt={`${selectedUser.first_name} ${selectedUser.last_name}`} />
                  <AvatarFallback>{selectedUser.first_name?.charAt(0)}{selectedUser.last_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{selectedUser.first_name} {selectedUser.last_name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedUser.location}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Skill</label>
              <Select value={selectedSkillForRequest} onValueChange={setSelectedSkillForRequest}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a skill for the exchange" />
                </SelectTrigger>
                <SelectContent>
                  {(learnMode ? selectedUser?.teachSkills : selectedUser?.learnSkills)?.map(skill => (
                    <SelectItem key={skill.id} value={skill.name}>{skill.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Introduce yourself and explain what you'd like to learn or teach..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendRequest} disabled={loading || !selectedSkillForRequest}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MatchingEngine;
