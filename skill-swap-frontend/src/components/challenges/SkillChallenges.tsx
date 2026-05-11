
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Challenge, User } from "@/types";
import { Clock, BarChart, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SkillChallengesProps {
  challenges: Challenge[];
  recommendedUsers: User[];
}

const SkillChallenges = ({ challenges, recommendedUsers }: SkillChallengesProps) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartChallenge = () => {
    setIsStarting(true);
    
    // In a real app, this would call an API to start the challenge
    setTimeout(() => {
      setIsStarting(false);
      setDialogOpen(false);
      
      toast({
        title: "Challenge Started",
        description: `You've started the "${selectedChallenge?.title}" challenge!`,
      });
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-600';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-600';
      case 'advanced':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            Skill Challenges
          </CardTitle>
          <CardDescription>
            Complete challenges with other users to practice your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden border">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                    <div className="flex items-center mt-3 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {challenge.durationMinutes} minutes
                    </div>
                    <Button 
                      className="w-full mt-3" 
                      size="sm"
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setDialogOpen(true);
                      }}
                    >
                      Start Challenge
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No challenges available for your skills.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {recommendedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recommended Partners</CardTitle>
            <CardDescription>People who might be interested in doing challenges with you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recommendedUsers.map((user) => (
                <div key={user.id} className="flex items-center p-3 border rounded-md">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Challenge: {selectedChallenge?.title}</DialogTitle>
            <DialogDescription>
              You can do this challenge alone or invite someone to join you
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Badge className={selectedChallenge ? getDifficultyColor(selectedChallenge.difficulty) : ''}>
                  {selectedChallenge?.difficulty}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {selectedChallenge?.durationMinutes} minutes
                </div>
              </div>
              <p className="text-sm mt-2">{selectedChallenge?.description}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Invite Partners (Optional)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recommendedUsers.slice(0, 4).map((user) => (
                  <div key={user.id} className="flex items-center p-2 border rounded-md">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7">Invite</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleStartChallenge}
              disabled={isStarting}
            >
              {isStarting ? "Starting..." : "Start Solo Challenge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillChallenges;
