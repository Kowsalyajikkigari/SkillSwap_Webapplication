
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { skills as allSkills } from "@/data/mockData";
import { Skill, PortfolioItem } from "@/types";
import SkillPortfolio from "./SkillPortfolio";

const ProfileForm = () => {
  const [name, setName] = useState("Alex Johnson");
  const [email, setEmail] = useState("alex@example.com");
  const [location, setLocation] = useState("New York, NY");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/150?img=1");
  const [teachSkills, setTeachSkills] = useState<Skill[]>([]);
  const [learnSkills, setLearnSkills] = useState<Skill[]>([]);
  const [availability, setAvailability] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillSelectionMode, setSkillSelectionMode] = useState<'teach' | 'learn'>('teach');

  const filteredSkills = allSkills.filter(skill => 
    skill.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const handleAddSkill = (skill: Skill) => {
    if (skillSelectionMode === 'teach') {
      if (!teachSkills.find(s => s.id === skill.id)) {
        setTeachSkills([...teachSkills, skill]);
      }
    } else {
      if (!learnSkills.find(s => s.id === skill.id)) {
        setLearnSkills([...learnSkills, skill]);
      }
    }
    setSkillSearch("");
    setShowSkillsDropdown(false);
  };

  const handleRemoveSkill = (skillId: string, type: 'teach' | 'learn') => {
    if (type === 'teach') {
      setTeachSkills(teachSkills.filter(s => s.id !== skillId));
    } else {
      setLearnSkills(learnSkills.filter(s => s.id !== skillId));
    }
  };
  
  const handleAddPortfolioItem = (item: Omit<PortfolioItem, 'id' | 'userId' | 'createdAt'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: `portfolio-${Date.now()}`,
      userId: 'current-user',
      createdAt: new Date()
    };
    setPortfolioItems([...portfolioItems, newItem]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate profile update process
    setTimeout(() => {
      setIsLoading(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in-custom">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Add your information to get started with SkillSwap</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center justify-center">
                <Avatar className="w-24 h-24 border-2 border-primary/20">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm" className="mt-4">
                  Change Photo
                </Button>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                rows={4}
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Skills I Can Teach</Label>
                <div className="relative">
                  <Input
                    placeholder="Search for skills..."
                    value={skillSearch}
                    onChange={(e) => {
                      setSkillSearch(e.target.value);
                      setShowSkillsDropdown(true);
                      setSkillSelectionMode('teach');
                    }}
                    onFocus={() => {
                      setShowSkillsDropdown(true);
                      setSkillSelectionMode('teach');
                    }}
                  />
                  
                  {showSkillsDropdown && skillSelectionMode === 'teach' && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleAddSkill(skill)}
                          >
                            <span>{skill.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({skill.category})</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-muted-foreground">No skills found</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {teachSkills.map((skill) => (
                    <div key={skill.id} className="skill-badge-teach flex items-center">
                      {skill.name}
                      <button
                        type="button"
                        className="ml-1 text-skill-teach hover:text-skill-teach/80"
                        onClick={() => handleRemoveSkill(skill.id, 'teach')}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Skills I Want to Learn</Label>
                <div className="relative">
                  <Input
                    placeholder="Search for skills..."
                    value={skillSearch}
                    onChange={(e) => {
                      setSkillSearch(e.target.value);
                      setShowSkillsDropdown(true);
                      setSkillSelectionMode('learn');
                    }}
                    onFocus={() => {
                      setShowSkillsDropdown(true);
                      setSkillSelectionMode('learn');
                    }}
                  />
                  
                  {showSkillsDropdown && skillSelectionMode === 'learn' && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredSkills.length > 0 ? (
                        filteredSkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleAddSkill(skill)}
                          >
                            <span>{skill.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">({skill.category})</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-muted-foreground">No skills found</div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {learnSkills.map((skill) => (
                    <div key={skill.id} className="skill-badge-learn flex items-center">
                      {skill.name}
                      <button
                        type="button"
                        className="ml-1 text-skill-learn hover:text-skill-learn/80"
                        onClick={() => handleRemoveSkill(skill.id, 'learn')}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Textarea 
                id="availability" 
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="E.g., Weekday evenings, Weekend mornings, etc."
              />
            </div>
            
            {/* New Skill Portfolio Section */}
            <div className="border-t pt-6 mt-6">
              <SkillPortfolio 
                userSkills={teachSkills}
                portfolioItems={portfolioItems}
                onAddPortfolioItem={handleAddPortfolioItem}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
