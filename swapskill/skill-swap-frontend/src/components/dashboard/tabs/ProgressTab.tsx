
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SkillProgress from "../../skills/SkillProgress";
import { Calendar, GraduationCap, MessageSquare } from "lucide-react";

interface ProgressTabProps {
  skillProgressData: {
    skillName: string;
    currentLevel: number;
    nextMilestone: number;
    skillPoints: number;
    badges: Array<{
      name: string;
      icon: "award" | "star" | "graduation-cap";
    }>;
  }
}

const ProgressTab: React.FC<ProgressTabProps> = ({ skillProgressData }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkillProgress
          skillName={skillProgressData.skillName}
          currentLevel={skillProgressData.currentLevel}
          nextMilestone={skillProgressData.nextMilestone}
          skillPoints={skillProgressData.skillPoints}
          badges={skillProgressData.badges}
        />
        
        <SkillProgress
          skillName="React"
          currentLevel={2}
          nextMilestone={300}
          skillPoints={210}
          badges={[
            { name: "Component Master", icon: "star" }
          ]}
        />
        
        <SkillProgress
          skillName="UI Design"
          currentLevel={1}
          nextMilestone={200}
          skillPoints={75}
          badges={[]}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Learning Path</CardTitle>
          <CardDescription>Your personalized skill development journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <div className="border rounded-md p-6 h-64 flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">
                  Learning path visualization coming soon
                </p>
              </div>
            </div>
            
            <div className="lg:w-1/3 space-y-4">
              <h3 className="text-lg font-medium">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-md">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Complete React Challenge</h4>
                    <p className="text-sm text-muted-foreground">
                      Build a dynamic form with validation
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-md">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Join a Study Group</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with others learning JavaScript
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-md">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Schedule Teaching Session</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your HTML/CSS knowledge
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTab;
