import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Jane Doe",
    username: "janedoe",
    avatar: "https://i.pravatar.cc/150?img=32",
    location: "New York, USA",
    rating: 4.8,
    exchanges: 24,
    teachSkills: ["Graphic Design", "UI/UX Design", "Branding"],
    learnSkills: ["Web Development", "Photography"],
    bio: "Passionate graphic designer with 5+ years of experience. I love creating beautiful and functional designs."
  },
  {
    id: 2,
    name: "John Smith",
    username: "johnsmith",
    avatar: "https://i.pravatar.cc/150?img=68",
    location: "London, UK",
    rating: 4.9,
    exchanges: 36,
    teachSkills: ["Web Development", "JavaScript", "React"],
    learnSkills: ["UI/UX Design", "Digital Marketing"],
    bio: "Full-stack developer specializing in React and Node.js. I enjoy building web applications and learning new technologies."
  },
  {
    id: 3,
    name: "Alex Lee",
    username: "alexlee",
    avatar: "https://i.pravatar.cc/150?img=47",
    location: "Toronto, Canada",
    rating: 4.7,
    exchanges: 18,
    teachSkills: ["Photography", "Video Editing", "Lightroom"],
    learnSkills: ["Graphic Design", "Content Writing"],
    bio: "Professional photographer specializing in portraits and landscapes. I can teach you how to take amazing photos with any camera."
  },
  {
    id: 4,
    name: "Sarah Johnson",
    username: "sarahj",
    avatar: "https://i.pravatar.cc/150?img=5",
    location: "Sydney, Australia",
    rating: 4.6,
    exchanges: 12,
    teachSkills: ["Digital Marketing", "SEO", "Social Media"],
    learnSkills: ["Video Editing", "Public Speaking"],
    bio: "Digital marketing specialist with expertise in SEO and social media marketing. I can help you grow your online presence."
  },
  {
    id: 5,
    name: "Michael Chen",
    username: "michaelc",
    avatar: "https://i.pravatar.cc/150?img=15",
    location: "San Francisco, USA",
    rating: 5.0,
    exchanges: 42,
    teachSkills: ["Mobile App Development", "Swift", "Flutter"],
    learnSkills: ["UI/UX Design", "Graphic Design"],
    bio: "Mobile app developer with experience in iOS and Android. I love creating intuitive and beautiful mobile applications."
  },
  {
    id: 6,
    name: "Emily Wilson",
    username: "emilyw",
    avatar: "https://i.pravatar.cc/150?img=23",
    location: "Berlin, Germany",
    rating: 4.9,
    exchanges: 30,
    teachSkills: ["Content Writing", "Copywriting", "Editing"],
    learnSkills: ["Digital Marketing", "Photography"],
    bio: "Professional writer and editor with a passion for storytelling. I can help you improve your writing skills and create compelling content."
  }
];

// Mock data for skills
const skillCategories = [
  { name: "Design", skills: ["Graphic Design", "UI/UX Design", "Web Design", "Logo Design", "Illustration"] },
  { name: "Development", skills: ["Web Development", "Mobile App Development", "JavaScript", "React", "Node.js", "Python"] },
  { name: "Marketing", skills: ["Digital Marketing", "SEO", "Social Media", "Content Marketing", "Email Marketing"] },
  { name: "Content", skills: ["Content Writing", "Copywriting", "Editing", "Proofreading", "Technical Writing"] },
  { name: "Photography", skills: ["Photography", "Video Editing", "Lightroom", "Photoshop", "Videography"] },
  { name: "Music", skills: ["Music Production", "Guitar", "Piano", "Singing", "Songwriting"] },
  { name: "Language", skills: ["English", "Spanish", "French", "German", "Mandarin", "Japanese"] },
  { name: "Business", skills: ["Financial Planning", "Accounting", "Business Strategy", "Project Management"] }
];

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [distanceRange, setDistanceRange] = useState([50]);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter users based on search term and selected skills
    const filtered = mockUsers.filter(user => {
      const matchesSearch = searchTerm === "" || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.teachSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSkills = selectedSkills.length === 0 || 
        user.teachSkills.some(skill => selectedSkills.includes(skill));
      
      return matchesSearch && matchesSkills;
    });
    
    setFilteredUsers(filtered);
  };
  
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Explore Skills & Members</h1>
            <p className="text-muted-foreground mt-2">Find the perfect skill match for your learning journey</p>
          </div>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for skills or members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="md:w-1/4">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">Location</h3>
                    <Select defaultValue="anywhere">
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anywhere">Anywhere</SelectItem>
                        <SelectItem value="nearby">Nearby</SelectItem>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="asia">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Distance (miles)</h3>
                    <Slider
                      defaultValue={[50]}
                      max={100}
                      step={1}
                      onValueChange={setDistanceRange}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0</span>
                      <span>{distanceRange[0]}</span>
                      <span>100</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Exchange Type</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="virtual" defaultChecked />
                        <label htmlFor="virtual" className="text-sm">Virtual</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="inPerson" defaultChecked />
                        <label htmlFor="inPerson" className="text-sm">In-Person</label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Rating</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating4plus" defaultChecked />
                        <label htmlFor="rating4plus" className="text-sm">4+ Stars</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="rating3plus" defaultChecked />
                        <label htmlFor="rating3plus" className="text-sm">3+ Stars</label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Experience Level</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="beginner" defaultChecked />
                        <label htmlFor="beginner" className="text-sm">Beginner</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="intermediate" defaultChecked />
                        <label htmlFor="intermediate" className="text-sm">Intermediate</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="advanced" defaultChecked />
                        <label htmlFor="advanced" className="text-sm">Advanced</label>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">Apply Filters</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:w-3/4">
            <Tabs defaultValue="members" className="mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredUsers.map(user => (
                    <Card key={user.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
                          <div className="absolute -bottom-10 left-6">
                            <Avatar className="h-20 w-20 ring-4 ring-background">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        
                        <div className="pt-12 px-6 pb-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.location}</p>
                            </div>
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500 mr-1">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                              <span className="font-medium">{user.rating}</span>
                              <span className="text-xs text-muted-foreground ml-2">({user.exchanges} exchanges)</span>
                            </div>
                          </div>
                          
                          <div className="space-y-4 mb-6">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Skills to Share:</h4>
                              <div className="flex flex-wrap gap-1">
                                {user.teachSkills.map((skill, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Looking to Learn:</h4>
                              <div className="flex flex-wrap gap-1">
                                {user.learnSkills.map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link to={`/profile/${user.id}`} className="flex-1">
                              <Button variant="default" size="sm" className="w-full">View Profile</Button>
                            </Link>
                            <Link to={`/message/${user.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">Message</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No members found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="skills" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skillCategories.map((category) => (
                    <Card key={category.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-4">{category.name}</h3>
                        <div className="space-y-2">
                          {category.skills.map((skill) => (
                            <div key={skill} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`skill-${skill}`} 
                                  checked={selectedSkills.includes(skill)}
                                  onCheckedChange={() => toggleSkill(skill)}
                                />
                                <label htmlFor={`skill-${skill}`} className="text-sm">{skill}</label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {Math.floor(Math.random() * 100) + 10}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
