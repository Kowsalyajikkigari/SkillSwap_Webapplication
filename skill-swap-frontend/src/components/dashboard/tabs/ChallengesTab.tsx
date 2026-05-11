
import React from "react";
import SkillChallenges from "../../challenges/SkillChallenges";
import { Challenge, User } from "@/types";

interface ChallengesTabProps {
  challenges: Challenge[];
  recommendedUsers: User[];
}

const ChallengesTab: React.FC<ChallengesTabProps> = ({ 
  challenges, 
  recommendedUsers 
}) => {
  return (
    <SkillChallenges 
      challenges={challenges}
      recommendedUsers={recommendedUsers}
    />
  );
};

export default ChallengesTab;
