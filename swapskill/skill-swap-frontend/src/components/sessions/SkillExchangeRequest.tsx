import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, ArrowLeft, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createSkillExchangeRequest } from "../../services/skill-exchange.service";
import { getCurrentUserProfile } from "../../services/profiles";
import { getAllSkills } from "../../services/skills";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  teachSkills?: Array<{ id: string; name: string; category: string }>;
  learnSkills?: Array<{ id: string; name: string; category: string }>;
}

const SkillExchangeRequest: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Array<{ id: number; name: string; category: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedSkill, setSelectedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");
  const [sessionType, setSessionType] = useState<"virtual" | "in_person">("virtual");
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load current user profile
      const currentUserProfile = await getCurrentUserProfile();
      setCurrentUser(currentUserProfile);
      
      // Load available skills
      const skills = await getAllSkills();
      setAvailableSkills(skills);
      
      // In a real app, we would load the target user's profile
      // For now, we'll create a mock user based on the userId
      const mockTargetUser: User = {
        id: parseInt(userId || "1"),
        first_name: "Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@example.com",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        bio: "Full-stack developer with 5 years of experience. Love teaching and learning new technologies.",
        location: "San Francisco, CA",
        teachSkills: [
          { id: "1", name: "React", category: "Frontend Development" },
          { id: "2", name: "JavaScript", category: "Programming Languages" },
          { id: "3", name: "Node.js", category: "Backend Development" }
        ],
        learnSkills: [
          { id: "4", name: "Python", category: "Programming Languages" },
          { id: "5", name: "Machine Learning", category: "Data Science" }
        ]
      };
      
      setTargetUser(mockTargetUser);
      
      // Set default message
      setMessage(`Hi ${mockTargetUser.first_name}! I'd love to learn from you and share my knowledge in return. Let's set up a skill exchange session!`);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSkill || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a skill and provide a message.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const selectedSkillObj = availableSkills.find(skill => skill.name === selectedSkill);
      
      await createSkillExchangeRequest({
        provider_id: parseInt(userId || "1"),
        skill_id: selectedSkillObj?.id || 1,
        message: message.trim(),
        proposed_date: proposedDate || undefined,
        proposed_time: proposedTime || undefined,
        session_type: sessionType,
        location: sessionType === "in_person" ? location : undefined,
      });
      
      toast({
        title: "Request Sent!",
        description: `Your skill exchange request has been sent to ${targetUser?.first_name}.`,
      });
      
      // Navigate to sessions page to see the request
      navigate("/sessions");
      
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">User Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The user you're trying to send a request to could not be found.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-in-custom">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Send Skill Exchange Request</CardTitle>
          <CardDescription>
            Request a skill exchange session with {targetUser.first_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Target User Info */}
          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={targetUser.avatar} alt={`${targetUser.first_name} ${targetUser.last_name}`} />
              <AvatarFallback>{targetUser.first_name.charAt(0)}{targetUser.last_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{targetUser.first_name} {targetUser.last_name}</h3>
              <p className="text-sm text-muted-foreground">{targetUser.location}</p>
              {targetUser.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{targetUser.bio}</p>
              )}
            </div>
          </div>

          {/* Skills they can teach */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Skills they can teach:</h4>
            <div className="flex flex-wrap gap-2">
              {targetUser.teachSkills?.map(skill => (
                <Badge key={skill.id} variant="secondary" className="bg-skill-teach/10 text-skill-teach">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Skill to Learn</label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a skill you want to learn" />
                </SelectTrigger>
                <SelectContent>
                  {targetUser.teachSkills?.map(skill => (
                    <SelectItem key={skill.id} value={skill.name}>{skill.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Introduce yourself and explain what you'd like to learn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Proposed Date (Optional)</label>
                <Input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Proposed Time (Optional)</label>
                <Input
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Session Type</label>
              <Select value={sessionType} onValueChange={(value: "virtual" | "in_person") => setSessionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2" />
                      Virtual Session
                    </div>
                  </SelectItem>
                  <SelectItem value="in_person">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      In-Person Session
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sessionType === "in_person" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter meeting location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillExchangeRequest;
