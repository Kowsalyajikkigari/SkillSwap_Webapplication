
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Skill } from "@/types";
import { Link } from "react-router-dom";

interface SkillsListProps {
  users: User[];
  filterSkill?: string;
  filterLocation?: string;
  type: 'teach' | 'learn';
}

const SkillsList: React.FC<SkillsListProps> = ({ users, filterSkill, filterLocation, type }) => {
  // Filter users based on skill and location
  const filteredUsers = users.filter(user => {
    const skillMatch = !filterSkill || 
      (type === 'teach' 
        ? user.teachSkills.some(skill => skill.name.toLowerCase().includes(filterSkill.toLowerCase()))
        : user.learnSkills.some(skill => skill.name.toLowerCase().includes(filterSkill.toLowerCase())));
    
    const locationMatch = !filterLocation || 
      (user.location && user.location.toLowerCase().includes(filterLocation.toLowerCase()));
    
    return skillMatch && locationMatch;
  });

  // Get skills for a user based on type
  const getUserSkills = (user: User): Skill[] => {
    return type === 'teach' ? user.teachSkills : user.learnSkills;
  };

  return (
    <div>
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.location}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500 mr-1">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                      {user.rating}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-2">
                    {type === 'teach' ? 'Can teach:' : 'Wants to learn:'}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getUserSkills(user).map((skill) => (
                      <span
                        key={skill.id}
                        className={type === 'teach' ? "skill-badge-teach" : "skill-badge-learn"}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm mt-4 text-muted-foreground">
                    <p>Available: {user.availability.join(", ")}</p>
                    <p className="mt-1">{user.sessionsCompleted} sessions completed</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    {type === 'teach' ? (
                      <Link to={`/request/${user.id}`} className="w-full">
                        <Button className="w-full">Request to Learn</Button>
                      </Link>
                    ) : (
                      <Button className="w-full">Offer to Teach</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search filters or check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillsList;
