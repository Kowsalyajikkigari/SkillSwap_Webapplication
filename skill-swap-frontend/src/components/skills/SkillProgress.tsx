
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Award, Star } from "lucide-react";

interface SkillProgressProps {
  skillName: string;
  currentLevel: number;
  nextMilestone: number;
  skillPoints: number;
  badges: { name: string; icon: "award" | "star" | "graduation-cap" }[];
}

const SkillProgress = ({
  skillName,
  currentLevel,
  nextMilestone,
  skillPoints,
  badges
}: SkillProgressProps) => {
  const progressPercentage = Math.min((skillPoints / nextMilestone) * 100, 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>{skillName} Mastery</span>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Level {currentLevel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {skillPoints} / {nextMilestone} points
            </span>
            <span className="text-primary font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {badges.length > 0 && (
          <div className="pt-2">
            <p className="text-sm mb-2">Achievements:</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md text-xs">
                  {badge.icon === "award" && <Award className="h-3 w-3 text-primary" />}
                  {badge.icon === "star" && <Star className="h-3 w-3 text-yellow-500" />}
                  {badge.icon === "graduation-cap" && <GraduationCap className="h-3 w-3 text-blue-500" />}
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillProgress;
