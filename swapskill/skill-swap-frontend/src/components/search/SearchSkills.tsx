
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users } from "@/data/mockData";
import SkillsList from "@/components/skills/SkillsList";
import { Search } from "lucide-react";

const SearchSkills = () => {
  const [skillSearch, setSkillSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'teach' | 'learn'>('learn');
  
  return (
    <div className="container mx-auto px-4 py-8 animate-in-custom">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Find Skills</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Connect with people to learn new skills or share your expertise
        </p>
        
        <div className="bg-muted/40 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="col-span-2">
              <label htmlFor="skill-search" className="block text-sm font-medium mb-1">
                Skill
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="skill-search"
                  placeholder="e.g. JavaScript, Photography, Guitar..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label htmlFor="location-search" className="block text-sm font-medium mb-1">
                Location
              </label>
              <Input
                id="location-search"
                placeholder="City, Country"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => { setSkillSearch(""); setLocationSearch(""); }}>
              Clear Filters
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="learn" onValueChange={(value) => setActiveTab(value as 'teach' | 'learn')}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="learn">Find Teachers</TabsTrigger>
            <TabsTrigger value="teach">Find Students</TabsTrigger>
          </TabsList>
          
          <TabsContent value="learn">
            <SkillsList 
              users={users} 
              filterSkill={skillSearch} 
              filterLocation={locationSearch} 
              type="teach"
            />
          </TabsContent>
          
          <TabsContent value="teach">
            <SkillsList 
              users={users} 
              filterSkill={skillSearch} 
              filterLocation={locationSearch} 
              type="learn"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SearchSkills;
