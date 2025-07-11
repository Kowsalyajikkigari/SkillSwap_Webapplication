
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface VideoChatProps {
  sessionId: string;
  onJoinSession: (url: string) => void;
}

const VideoChat = ({ sessionId, onJoinSession }: VideoChatProps) => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  
  const handleCreateRoom = () => {
    setIsCreatingRoom(true);
    
    // In a real app, this would call an API to create a room
    setTimeout(() => {
      // Generate a room URL (in a real app, this would be from a service like Jitsi)
      const roomUrl = `https://meet.jit.si/skillswap-session-${sessionId}`;
      
      setIsCreatingRoom(false);
      
      toast({
        title: "Video room created",
        description: "Your session room is ready to join",
      });
      
      onJoinSession(roomUrl);
      
      // Open the room in a new tab
      window.open(roomUrl, '_blank');
    }, 1000);
  };
  
  const handleJoinExisting = () => {
    if (!customUrl) {
      toast({
        title: "Missing URL",
        description: "Please enter a valid meeting URL",
        variant: "destructive",
      });
      return;
    }
    
    setIsJoining(true);
    
    // Validate URL (basic check)
    if (!customUrl.startsWith('http')) {
      setIsJoining(false);
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we might validate the URL further
    setTimeout(() => {
      setIsJoining(false);
      onJoinSession(customUrl);
      
      // Open the room in a new tab
      window.open(customUrl, '_blank');
    }, 500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Session</CardTitle>
        <CardDescription>
          Create or join a video meeting for your skill swap session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Create New Meeting</h3>
          <Button 
            onClick={handleCreateRoom}
            disabled={isCreatingRoom}
            className="w-full"
          >
            {isCreatingRoom ? "Creating Room..." : "Create Video Room"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Creates a secure video room using Jitsi Meet (no account required)
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or join existing
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Join Existing Meeting</h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Paste meeting URL (Zoom, Google Meet, etc.)"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
            <Button 
              onClick={handleJoinExisting}
              disabled={isJoining}
            >
              Join
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 flex justify-between text-sm text-muted-foreground">
        <span>Session ID: {sessionId}</span>
      </CardFooter>
    </Card>
  );
};

export default VideoChat;
