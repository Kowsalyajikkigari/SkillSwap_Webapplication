
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { users } from "@/data/mockData";
import { Skill } from "@/types";

const SessionRequest = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Find the user from mock data
  const user = users.find(user => user.id === userId);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <p className="mb-6">We couldn't find the user you're looking for.</p>
        <Button onClick={() => navigate("/search")}>
          Back to Search
        </Button>
      </div>
    );
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSkill) {
      toast({
        title: "Please select a skill",
        description: "You need to select a skill you want to learn.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate request submission
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Request sent!",
        description: `Your learning request has been sent to ${user.name}.`,
      });
      
      navigate("/dashboard");
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-in-custom">
      <Card>
        <CardHeader>
          <CardTitle>Request a Learning Session</CardTitle>
          <CardDescription>Send a request to learn from this teacher</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6 p-4 bg-muted/40 rounded-lg">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-muted-foreground">{user.location}</p>
              <div className="flex items-center mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500 mr-1">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <span>{user.rating}</span>
                <span className="text-muted-foreground ml-2">({user.sessionsCompleted} sessions)</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="skill">Skill to Learn</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {user.teachSkills.map((skill: Skill) => (
                  <div 
                    key={skill.id}
                    className={`border rounded-md p-3 cursor-pointer hover:border-primary transition-colors ${
                      selectedSkill === skill.id ? 'bg-primary/5 border-primary' : ''
                    }`}
                    onClick={() => setSelectedSkill(skill.id)}
                  >
                    <h4 className={`font-medium ${selectedSkill === skill.id ? 'text-primary' : ''}`}>
                      {skill.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{skill.category}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and explain what you'd like to learn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
            
            <div className="bg-muted/40 p-4 rounded-md text-sm">
              <h4 className="font-semibold mb-2">Teacher's Availability</h4>
              <ul className="list-disc list-inside space-y-1">
                {user.availability.map((time, index) => (
                  <li key={index}>{time}</li>
                ))}
              </ul>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !selectedSkill}>
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SessionRequest;
