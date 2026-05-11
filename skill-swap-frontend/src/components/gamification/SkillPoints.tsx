
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, GraduationCap, ThumbsUp, MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface PointsActivity {
  id: string;
  activity: string;
  points: number;
  date: Date;
  type: "teaching" | "learning" | "community" | "challenge";
}

interface SkillPointsProps {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  recentActivities: PointsActivity[];
}

const SkillPoints = ({
  totalPoints,
  level,
  nextLevelPoints,
  recentActivities
}: SkillPointsProps) => {
  const progressToNextLevel = Math.min((totalPoints / nextLevelPoints) * 100, 100);
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "teaching":
        return <GraduationCap className="h-4 w-4 text-green-500" />;
      case "learning":
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "community":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "challenge":
        return <Award className="h-4 w-4 text-orange-500" />;
      default:
        return <ThumbsUp className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>Skill Points</span>
          <Badge className="bg-yellow-500/90 hover:bg-yellow-500">
            Level {level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{totalPoints} XP</span>
            <span className="text-muted-foreground">{nextLevelPoints} XP needed for Level {level + 1}</span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {getActivityIcon(activity.type)}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span>{activity.activity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green-600 font-medium">+{activity.points}</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.date.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-2">How to earn more points</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>Complete skill challenges (+20-100 points)</span>
            </li>
            <li className="flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-primary" />
              <span>Teach a skill session (+50 points)</span>
            </li>
            <li className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>Participate in forums (+5-15 points)</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillPoints;
