
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Skill } from "@/types";

interface SkillRecommendationsProps {
  recommendedTeachSkills: Skill[];
  recommendedLearnSkills: Skill[];
  onAddSkill: (skill: Skill, type: 'teach' | 'learn') => void;
}

const SkillRecommendations = ({ 
  recommendedTeachSkills, 
  recommendedLearnSkills, 
  onAddSkill 
}: SkillRecommendationsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Skill Recommendations
        </CardTitle>
        <CardDescription>Based on your profile and session history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recommendedTeachSkills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Skills you might want to teach</h3>
              <div className="flex flex-wrap gap-2">
                {recommendedTeachSkills.map((skill) => (
                  <div 
                    key={skill.id} 
                    className="bg-skill-teach/5 border border-skill-teach/20 text-skill-teach rounded-md p-2 flex flex-col"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">{skill.category}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-skill-teach hover:text-skill-teach/80 hover:bg-skill-teach/10 w-full justify-start"
                      onClick={() => onAddSkill(skill, 'teach')}
                    >
                      + Add to my teaching skills
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {recommendedLearnSkills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-3">Skills you might want to learn</h3>
              <div className="flex flex-wrap gap-2">
                {recommendedLearnSkills.map((skill) => (
                  <div 
                    key={skill.id} 
                    className="bg-skill-learn/5 border border-skill-learn/20 text-skill-learn rounded-md p-2 flex flex-col"
                  >
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-xs text-muted-foreground">{skill.category}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-skill-learn hover:text-skill-learn/80 hover:bg-skill-learn/10 w-full justify-start"
                      onClick={() => onAddSkill(skill, 'learn')}
                    >
                      + Add to my learning skills
                    </Button>
                  </div>
                ))}
              </div>
              <div className="text-center pt-4 text-sm text-muted-foreground">
                <p>People who learn similar skills also learned these</p>
              </div>
            </div>
          )}
          
          {recommendedTeachSkills.length === 0 && recommendedLearnSkills.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Complete more skill sessions to get personalized recommendations
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillRecommendations;
