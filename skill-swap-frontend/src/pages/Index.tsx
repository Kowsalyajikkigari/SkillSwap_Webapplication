import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Import directly from relative paths to avoid path resolution issues
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Check, Calendar, MessageCircle, Search, Trophy, User, Users } from "lucide-react";
// Import types
import { Skill, User as UserType, Stats } from "../types";

const Index = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default stats that will be shown if API fails
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    totalSessions: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use mock data for public landing page since API requires authentication
        // TODO: Create public endpoints for landing page statistics
        const mockSkillsData = [
          { id: 1, name: 'JavaScript', category: 'Programming' },
          { id: 2, name: 'Python', category: 'Programming' },
          { id: 3, name: 'Graphic Design', category: 'Design' },
          { id: 4, name: 'Photography', category: 'Arts' },
          { id: 5, name: 'Spanish', category: 'Languages' },
        ];
        const mockUsersData = [
          { id: 1, name: 'John Doe', skills: ['JavaScript', 'React'] },
          { id: 2, name: 'Jane Smith', skills: ['Python', 'Django'] },
          { id: 3, name: 'Mike Johnson', skills: ['Design', 'Photography'] },
        ];

        setSkills(mockSkillsData);
        setUsers(mockUsersData);
        setStats({
          totalUsers: mockUsersData.length,
          totalSkills: mockSkillsData.length,
          totalSessions: 0 // TODO: Fetch from sessions API
        });
      } catch (err: any) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background py-20 md:py-32">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary/5 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-accent/5 blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-8">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 text-primary font-medium text-sm">
                Learn • Teach • Connect
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Share Your <span className="text-primary">Skills</span>,<br />
                Discover New <span className="text-primary">Talents</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
                Join the community where skills are the currency. Exchange knowledge, grow together, and build meaningful connections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all">
                    Join for Free
                  </Button>
                </Link>
                <Link to="/search">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5">
                    Explore Skills
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-muted shadow-sm">
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-bold text-primary">{stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : "10K+"}</span>
                  <span className="text-sm text-muted-foreground">Active Users</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-bold text-primary">{stats.totalSkills > 0 ? stats.totalSkills.toLocaleString() : "500+"}</span>
                  <span className="text-sm text-muted-foreground">Unique Skills</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl md:text-3xl font-bold text-primary">{stats.totalSessions > 0 ? stats.totalSessions.toLocaleString() : "25K+"}</span>
                  <span className="text-sm text-muted-foreground">Exchanges</span>
                </div>
              </div>
            </div>

            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-lg rotate-6 z-0"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-secondary/10 rounded-lg -rotate-6 z-0"></div>

                <div className="relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="https://i.pravatar.cc/150?img=5" alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Programming</p>
                            <p className="text-xs text-muted-foreground">Python, JavaScript</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden transform translate-y-6 shadow-lg hover:scale-105 transition-transform duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="https://i.pravatar.cc/150?img=6" alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Arts</p>
                            <p className="text-xs text-muted-foreground">Photography, Drawing</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden transform translate-y-3 shadow-lg hover:scale-105 transition-transform duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="https://i.pravatar.cc/150?img=7" alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Languages</p>
                            <p className="text-xs text-muted-foreground">Spanish, French</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden transform translate-y-9 shadow-lg hover:scale-105 transition-transform duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="https://i.pravatar.cc/150?img=8" alt="User" />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Music</p>
                            <p className="text-xs text-muted-foreground">Guitar, Piano</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary/20 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-secondary/10 text-secondary font-medium text-sm">
              Simple Process
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">How SkillSwap Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exchange skills with others in the community without exchanging money. It's simple, fair, and enriching.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-muted relative z-10 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">1</div>
                <h3 className="text-xl font-semibold mb-4 text-center">Create Profile</h3>
                <p className="text-muted-foreground text-center">
                  Sign up and create your profile with the skills you can offer and what you're looking to learn.
                </p>
                <div className="mt-6 pt-6 border-t border-dashed border-muted">
                  <div className="flex items-center text-sm text-primary">
                    <span className="font-medium">Quick Setup</span>
                    <span className="ml-auto">5 min</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-muted relative z-10 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">2</div>
                <h3 className="text-xl font-semibold mb-4 text-center">Discover Skills</h3>
                <p className="text-muted-foreground text-center">
                  Browse available skills and find members who are offering what you want to learn.
                </p>
                <div className="mt-6 pt-6 border-t border-dashed border-muted">
                  <div className="flex items-center text-sm text-primary">
                    <span className="font-medium">Smart Matching</span>
                    <span className="ml-auto">AI-Powered</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-muted relative z-10 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">3</div>
                <h3 className="text-xl font-semibold mb-4 text-center">Connect & Arrange</h3>
                <p className="text-muted-foreground text-center">
                  Message directly with potential skill exchange partners and schedule your sessions.
                </p>
                <div className="mt-6 pt-6 border-t border-dashed border-muted">
                  <div className="flex items-center text-sm text-primary">
                    <span className="font-medium">Secure Messaging</span>
                    <span className="ml-auto">Real-time</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-muted relative z-10 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">4</div>
                <h3 className="text-xl font-semibold mb-4 text-center">Exchange & Grow</h3>
                <p className="text-muted-foreground text-center">
                  Meet up (virtually or in-person), share your knowledge, and learn new skills.
                </p>
                <div className="mt-6 pt-6 border-t border-dashed border-muted">
                  <div className="flex items-center text-sm text-primary">
                    <span className="font-medium">Track Progress</span>
                    <span className="ml-auto">Earn Badges</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg">
                Start Your Skill Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div className="md:max-w-2xl mb-8 md:mb-0">
              <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
                Trending Now
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Popular Skills on SkillSwap</h2>
              <p className="text-lg text-muted-foreground">
                Discover the most sought-after skills in our community and find someone to trade with.
              </p>
            </div>
            <Link to="/search" className="self-start md:self-auto">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 group">
                View All Skills
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-muted/50 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-full group-hover:scale-110 transition-transform">
                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968705.png" alt="Graphic Design" className="w-12 h-12" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
              </div>
              <h3 className="font-medium mb-1 text-lg">Graphic Design</h3>
              <p className="text-xs text-muted-foreground">Logos, Branding, Illustrations</p>
              <div className="mt-4 text-xs font-medium text-primary">
                <span>1,240+ members</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-muted/50 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-pink-500/10 to-pink-600/20 rounded-full group-hover:scale-110 transition-transform">
                <img src="https://cdn-icons-png.flaticon.com/512/2553/2553691.png" alt="Personal Care" className="w-12 h-12" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
              </div>
              <h3 className="font-medium mb-1 text-lg">Personal Care</h3>
              <p className="text-xs text-muted-foreground">Hair Styling, Makeup, Massage</p>
              <div className="mt-4 text-xs font-medium text-primary">
                <span>890+ members</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-muted/50 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-full group-hover:scale-110 transition-transform">
                <img src="https://cdn-icons-png.flaticon.com/512/2936/2936886.png" alt="Fitness" className="w-12 h-12" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
              </div>
              <h3 className="font-medium mb-1 text-lg">Fitness</h3>
              <p className="text-xs text-muted-foreground">Personal Training, Yoga, Nutrition</p>
              <div className="mt-4 text-xs font-medium text-primary">
                <span>1,560+ members</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-muted/50 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-full group-hover:scale-110 transition-transform">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135706.png" alt="Legal" className="w-12 h-12" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
              </div>
              <h3 className="font-medium mb-1 text-lg">Legal</h3>
              <p className="text-xs text-muted-foreground">Contracts, Advice, Documentation</p>
              <div className="mt-4 text-xs font-medium text-primary">
                <span>420+ members</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-muted/50 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 rounded-full group-hover:scale-110 transition-transform">
                <img src="https://cdn-icons-png.flaticon.com/512/2970/2970785.png" alt="Art" className="w-12 h-12" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
              </div>
              <h3 className="font-medium mb-1 text-lg">Art</h3>
              <p className="text-xs text-muted-foreground">Painting, Sculpture, Photography</p>
              <div className="mt-4 text-xs font-medium text-primary">
                <span>980+ members</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-muted/50 group">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-red-500/10 to-red-600/20 rounded-full group-hover:scale-110 transition-transform">
                <img src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png" alt="Cooking" className="w-12 h-12" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
              </div>
              <h3 className="font-medium mb-1 text-lg">Cooking</h3>
              <p className="text-xs text-muted-foreground">Baking, Cuisine, Meal Prep</p>
              <div className="mt-4 text-xs font-medium text-primary">
                <span>1,120+ members</span>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 flex items-center">
              <div className="mr-6 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Verified Skills</h3>
                <p className="text-sm text-muted-foreground">All skills are verified through reviews and ratings</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 flex items-center">
              <div className="mr-6 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M20 7h-9"></path>
                  <path d="M14 17H5"></path>
                  <circle cx="17" cy="17" r="3"></circle>
                  <circle cx="7" cy="7" r="3"></circle>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">Fair Exchanges</h3>
                <p className="text-sm text-muted-foreground">Our point system ensures balanced skill trades</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 flex items-center">
              <div className="mr-6 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium mb-1">No Money Involved</h3>
                <p className="text-sm text-muted-foreground">Pure skill exchange without financial transactions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Members */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div className="md:max-w-2xl mb-8 md:mb-0">
              <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-secondary/10 text-secondary font-medium text-sm">
                Community Highlights
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Featured Members</h2>
              <p className="text-lg text-muted-foreground">
                Meet some of our outstanding members who are ready to share their skills and knowledge.
              </p>
            </div>
            <Link to="/search" className="self-start md:self-auto">
              <Button variant="outline" className="border-secondary text-secondary hover:bg-secondary/5 group">
                View All Members
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {users.slice(0, 4).map((user, index) => (
              <div key={user.id || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-muted/50 group hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-gray-800">
                      <AvatarImage src={user.avatar || `https://i.pravatar.cc/150?img=${30 + index}`} />
                      <AvatarFallback className="text-lg">{user.first_name ? user.first_name.charAt(0) : 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="pt-16 px-6 pb-6">
                  <div className="text-center mb-6">
                    <h3 className="font-bold text-xl">{user.first_name} {user.last_name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center justify-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {user.location || "Member"}
                    </p>

                    <div className="flex items-center justify-center mt-2">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-500">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span className="ml-1 text-sm font-medium">{4.5 + (index * 0.1)}</span>
                      </div>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{10 + (index * 5)} exchanges</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-primary">
                          <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path>
                          <circle cx="17" cy="7" r="5"></circle>
                        </svg>
                        Skills to Share
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(user.teachSkills || ["Graphic Design", "Web Development", "UI/UX Design"]).slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {typeof skill === 'string' ? skill : skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-secondary">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4l3 3"></path>
                        </svg>
                        Looking to Learn
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {(user.learnSkills || ["Photography", "Marketing", "Social Media"]).slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                            {typeof skill === 'string' ? skill : skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-dashed border-muted flex gap-2">
                    <Link to={`/profile/${user.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">View Profile</Button>
                    </Link>
                    <Link to={`/message/${user.id}`} className="w-10">
                      <Button variant="outline" size="sm" className="w-full p-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
              Success Stories
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">What Our Community Says</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from people who have experienced the power of skill swapping in our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-muted/50 relative">
              <div className="absolute -top-5 -left-5 text-6xl text-primary/20 font-serif">"</div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">5.0</span>
                </div>

                <p className="italic text-lg leading-relaxed">
                  "I've been able to get professional photography for my portfolio while offering my design skills. SkillSwap made it easy to find the perfect match!"
                </p>
              </div>

              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4 ring-2 ring-primary/10">
                  <AvatarImage src="https://i.pravatar.cc/150?img=32" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Jane Doe</h3>
                  <p className="text-sm text-muted-foreground">Graphic Designer</p>
                </div>
                <div className="ml-auto flex space-x-1">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-blue-500">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-blue-500">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-muted/50 relative md:translate-y-8">
              <div className="absolute -top-5 -left-5 text-6xl text-primary/20 font-serif">"</div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">5.0</span>
                </div>

                <p className="italic text-lg leading-relaxed">
                  "SkillSwap helped me improve my public speaking skills by trading my coding expertise. It's a win-win for everyone involved!"
                </p>
              </div>

              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4 ring-2 ring-primary/10">
                  <AvatarImage src="https://i.pravatar.cc/150?img=68" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">John Smith</h3>
                  <p className="text-sm text-muted-foreground">Software Developer</p>
                </div>
                <div className="ml-auto flex space-x-1">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-blue-500">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-muted/50 relative">
              <div className="absolute -top-5 -left-5 text-6xl text-primary/20 font-serif">"</div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">5.0</span>
                </div>

                <p className="italic text-lg leading-relaxed">
                  "I've met amazing people through SkillSwap. Not only did I trade skills, but I also made valuable connections in my community."
                </p>
              </div>

              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4 ring-2 ring-primary/10">
                  <AvatarImage src="https://i.pravatar.cc/150?img=47" />
                  <AvatarFallback>AL</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Alex Lee</h3>
                  <p className="text-sm text-muted-foreground">Fitness Instructor</p>
                </div>
                <div className="ml-auto flex space-x-1">
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-blue-500">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-blue-500">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link to="/testimonials">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 group">
                Read More Success Stories
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Who Can Join */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center mb-16">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-secondary/10 text-secondary font-medium text-sm">
                For Everyone
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Who Can Join SkillSwap?</h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Our platform welcomes everyone with a skill to share and a desire to learn. No matter your background or expertise level, there's a place for you in our community.
              </p>

              <div className="mt-8">
                <Link to="/register">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white shadow-lg hover:shadow-xl transition-all">
                    Join SkillSwap Today
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:w-1/2 md:pl-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-full">
                    <img src="https://cdn-icons-png.flaticon.com/512/3281/3281289.png" alt="Business Owners" className="w-10 h-10" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Business Owners</h3>
                  <p className="text-sm text-muted-foreground">
                    Trade services with other businesses to reduce costs and expand your network.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-full">
                    <img src="https://cdn-icons-png.flaticon.com/512/2970/2970785.png" alt="Artists" className="w-10 h-10" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Artists</h3>
                  <p className="text-sm text-muted-foreground">
                    Exchange your creative talents for skills that help grow your artistic career.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-full">
                    <img src="https://cdn-icons-png.flaticon.com/512/2620/2620576.png" alt="Freelancers" className="w-10 h-10" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Freelancers</h3>
                  <p className="text-sm text-muted-foreground">
                    Barter your professional skills to access expertise that complements your business.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 hover:shadow-lg transition-all transform hover:-translate-y-1">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gradient-to-br from-yellow-500/10 to-yellow-600/20 rounded-full">
                    <img src="https://cdn-icons-png.flaticon.com/512/4207/4207247.png" alt="Individuals" className="w-10 h-10" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/48'} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Individuals</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your personal skills and hobbies to get help with things you need done.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start">
                <div className="mr-4 w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">No Experience Required</h3>
                  <p className="text-muted-foreground">
                    Everyone has something valuable to share. Whether you're a beginner or an expert, your skills are welcome here.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Global Community</h3>
                  <p className="text-muted-foreground">
                    Connect with members from around the world or focus on your local area for in-person skill exchanges.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Safe & Secure</h3>
                  <p className="text-muted-foreground">
                    Our verification system and community reviews help ensure quality exchanges and trustworthy members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-muted/10 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary font-medium text-sm">
              Got Questions?
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get answers to common questions about skill swapping, membership, and platform use.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 hover:shadow-lg transition-all">
                <div className="flex items-start">
                  <div className="mr-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-semibold text-primary">Q</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">How does skill swapping work on SkillSwap?</h3>
                    <div className="flex items-start">
                      <div className="mr-4 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="font-semibold text-secondary">A</span>
                      </div>
                      <p className="text-muted-foreground">
                        Members list skills they can teach and skills they want to learn. When there's a match, they connect through our platform to arrange the exchange. No money changes hands - just skills for skills. Our matching algorithm helps you find the perfect skill exchange partners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 hover:shadow-lg transition-all">
                <div className="flex items-start">
                  <div className="mr-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-semibold text-primary">Q</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Is membership really free?</h3>
                    <div className="flex items-start">
                      <div className="mr-4 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="font-semibold text-secondary">A</span>
                      </div>
                      <p className="text-muted-foreground">
                        Yes! Basic membership is completely free and gives you access to all essential features. We also offer premium tiers with additional features like priority matching, advanced search filters, and featured profile placement for those who want to enhance their experience.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 hover:shadow-lg transition-all">
                <div className="flex items-start">
                  <div className="mr-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-semibold text-primary">Q</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">How do I know if someone is reliable?</h3>
                    <div className="flex items-start">
                      <div className="mr-4 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="font-semibold text-secondary">A</span>
                      </div>
                      <p className="text-muted-foreground">
                        All members have ratings and reviews from previous exchanges. We also verify identities through a secure process and have a robust reporting system to maintain a trustworthy community. You can view a member's verification badges, ratings, and exchange history before connecting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-muted/50 hover:shadow-lg transition-all">
                <div className="flex items-start">
                  <div className="mr-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-semibold text-primary">Q</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">What if the skills exchanged aren't equal in value?</h3>
                    <div className="flex items-start">
                      <div className="mr-4 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="font-semibold text-secondary">A</span>
                      </div>
                      <p className="text-muted-foreground">
                        Members can negotiate the terms of their exchange. Our platform includes a point system to track value, allowing for fair exchanges even when skills differ in market value. Many members also agree on multiple sessions or additional skills to balance the exchange. The platform helps facilitate these negotiations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link to="/faq">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 group">
                  View All FAQs
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-xl border border-muted/50 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Start Swapping Skills?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Join our community today and begin exchanging skills with talented people from around the world.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all px-8 py-6 text-lg">
                  Join for Free
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5 px-8 py-6 text-lg">
                  Browse Available Skills
                </Button>
              </Link>
            </div>

            <div className="mt-10 pt-10 border-t border-dashed border-muted">
              <p className="text-muted-foreground mb-4">Join thousands of members already exchanging skills</p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Avatar key={i} className="h-10 w-10 border-2 border-white dark:border-gray-800">
                      <AvatarImage src={`https://i.pravatar.cc/150?img=${20 + i}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  ))}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary text-xs font-medium border-2 border-white dark:border-gray-800">
                    +2K
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <span className="font-medium">4.9/5</span>
                  <span className="text-muted-foreground">(2,945 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                  <path d="M20 7h-3"></path>
                  <path d="M14 17H5"></path>
                  <circle cx="17" cy="17" r="3"></circle>
                  <circle cx="7" cy="7" r="3"></circle>
                </svg>
                <h3 className="font-bold text-2xl">SkillSwap</h3>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                The modern way to exchange skills and knowledge without money. Connect with people who want to learn what you know and teach what you want to learn.
              </p>
              <div className="flex space-x-4 mb-8">
                <a href="https://facebook.com/skillswap" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="https://twitter.com/skillswap" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="https://instagram.com/skillswap" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://linkedin.com/company/skillswap" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-muted/50">
                <h4 className="font-semibold mb-3">Subscribe to our newsletter</h4>
                <p className="text-sm text-muted-foreground mb-4">Get the latest updates, tips and success stories.</p>
                <div className="flex">
                  <input type="email" placeholder="Your email" className="flex-1 px-4 py-2 rounded-l-md border border-r-0 border-muted focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Platform</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
                <li><Link to="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
                <li><Link to="/trust" className="text-muted-foreground hover:text-primary transition-colors">Trust & Safety</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
                <li><Link to="/accessibility" className="text-muted-foreground hover:text-primary transition-colors">Accessibility</Link></li>
              </ul>

              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Contact</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-primary">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>(123) 456-7890</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-primary">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>support@skillswap.com</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground mb-4 md:mb-0">&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
              <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookies</Link>
              <Link to="/sitemap" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
