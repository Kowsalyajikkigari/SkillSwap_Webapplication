import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Calendar, Clock, ChevronRight, BookOpen, ArrowRight } from "lucide-react";

// Mock blog posts data
const mockBlogPosts = [
  {
    id: 1,
    title: "10 Tips for Effective Skill Swapping",
    excerpt: "Learn how to make the most of your skill exchanges with these proven strategies for successful learning and teaching.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600",
    category: "Tips & Tricks",
    author: {
      name: "Jane Doe",
      avatar: "https://i.pravatar.cc/150?img=32",
      role: "Community Manager"
    },
    date: "November 10, 2023",
    readTime: "5 min read",
    tags: ["Skill Exchange", "Learning", "Teaching"],
    featured: true
  },
  {
    id: 2,
    title: "How to Prepare for Your First Skill Swap Session",
    excerpt: "First-time jitters? Here's a comprehensive guide to help you prepare for and ace your first skill swap session.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600",
    category: "Guides",
    author: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/150?img=68",
      role: "Learning Expert"
    },
    date: "November 5, 2023",
    readTime: "8 min read",
    tags: ["Beginners", "Preparation", "Session Tips"],
    featured: true
  },
  {
    id: 3,
    title: "The Psychology of Skill Acquisition: How We Learn New Skills",
    excerpt: "Dive into the fascinating science behind how our brains acquire and master new skills, and how you can use this knowledge to learn more effectively.",
    image: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&q=80&w=600",
    category: "Learning Science",
    author: {
      name: "Dr. Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=5",
      role: "Cognitive Psychologist"
    },
    date: "October 28, 2023",
    readTime: "12 min read",
    tags: ["Psychology", "Learning", "Skill Acquisition"],
    featured: false
  },
  {
    id: 4,
    title: "Building Your Teaching Methodology: A Guide for Skill Sharers",
    excerpt: "Learn how to structure your teaching approach to provide the best learning experience for your skill swap partners.",
    image: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?auto=format&fit=crop&q=80&w=600",
    category: "Teaching",
    author: {
      name: "Michael Chen",
      avatar: "https://i.pravatar.cc/150?img=15",
      role: "Education Specialist"
    },
    date: "October 20, 2023",
    readTime: "10 min read",
    tags: ["Teaching", "Methodology", "Skill Sharing"],
    featured: false
  },
  {
    id: 5,
    title: "Success Stories: How Skill Swapping Changed These Members' Lives",
    excerpt: "Read inspiring stories from community members who transformed their personal and professional lives through skill swapping.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600",
    category: "Success Stories",
    author: {
      name: "Emily Wilson",
      avatar: "https://i.pravatar.cc/150?img=23",
      role: "Content Writer"
    },
    date: "October 15, 2023",
    readTime: "7 min read",
    tags: ["Success", "Community", "Inspiration"],
    featured: false
  },
  {
    id: 6,
    title: "Virtual vs. In-Person Skill Swapping: Pros and Cons",
    excerpt: "Explore the advantages and disadvantages of both virtual and in-person skill exchanges to decide which format works best for you.",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=600",
    category: "Guides",
    author: {
      name: "Alex Lee",
      avatar: "https://i.pravatar.cc/150?img=47",
      role: "Remote Learning Expert"
    },
    date: "October 8, 2023",
    readTime: "6 min read",
    tags: ["Virtual Learning", "In-Person", "Comparison"],
    featured: false
  }
];

// Mock resources data
const mockResources = [
  {
    id: 1,
    title: "Beginner's Guide to SkillSwap",
    description: "A comprehensive guide for new members to get started with skill swapping.",
    type: "PDF Guide",
    downloadUrl: "/resources/beginners-guide.pdf",
    icon: "book"
  },
  {
    id: 2,
    title: "Effective Teaching Techniques",
    description: "Learn proven teaching methods to help others acquire skills more effectively.",
    type: "Video Course",
    downloadUrl: "/resources/teaching-techniques",
    icon: "video"
  },
  {
    id: 3,
    title: "Session Planning Template",
    description: "A ready-to-use template to plan and structure your skill swap sessions.",
    type: "Template",
    downloadUrl: "/resources/session-template.docx",
    icon: "file"
  },
  {
    id: 4,
    title: "Feedback Collection Form",
    description: "Use this form to gather constructive feedback after your sessions.",
    type: "Template",
    downloadUrl: "/resources/feedback-form.pdf",
    icon: "file"
  }
];

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [blogPosts, setBlogPosts] = useState(mockBlogPosts);
  const [resources, setResources] = useState(mockResources);
  
  // Filter blog posts based on search term and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = category === "all" || post.category === category;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get featured posts
  const featuredPosts = blogPosts.filter(post => post.featured);
  
  // Get unique categories
  const categories = ["all", ...new Set(blogPosts.map(post => post.category))];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Blog & Resources</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Discover articles, guides, and resources to enhance your skill swapping experience
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles and resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="blog">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="blog">Blog Articles</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog">
            {/* Featured Posts */}
            {featuredPosts.length > 0 && searchTerm === "" && category === "all" && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredPosts.map(post => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="relative h-48">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-primary text-white">{post.category}</Badge>
                        </div>
                      </div>
                      <CardContent className="pt-6">
                        <Link to={`/blog/${post.id}`}>
                          <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{post.author.name}</p>
                              <p className="text-xs text-muted-foreground">{post.author.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="mr-2">{post.date}</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* All Posts */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {searchTerm || category !== "all" ? "Search Results" : "Latest Articles"}
                </h2>
                {searchTerm || category !== "all" ? (
                  <p className="text-muted-foreground">
                    {filteredPosts.length} {filteredPosts.length === 1 ? "result" : "results"} found
                  </p>
                ) : null}
              </div>
              
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredPosts.map(post => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="relative h-40">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                        </div>
                      </div>
                      <CardContent className="pt-4">
                        <Link to={`/blog/${post.id}`}>
                          <h3 className="text-lg font-bold mb-2 line-clamp-2 hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{post.author.name}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{post.date}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Link to={`/blog/${post.id}`} className="text-primary text-sm font-medium flex items-center hover:underline">
                          Read more
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No articles found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    We couldn't find any articles matching your search criteria. Try adjusting your filters or search term.
                  </p>
                  <Button onClick={() => { setSearchTerm(""); setCategory("all"); }}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="resources">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Learning Resources</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resources.map(resource => (
                  <Card key={resource.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          {resource.icon === "book" && (
                            <BookOpen className="h-6 w-6 text-primary" />
                          )}
                          {resource.icon === "video" && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                              <polygon points="23 7 16 12 23 17 23 7"></polygon>
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                            </svg>
                          )}
                          {resource.icon === "file" && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                              <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1">{resource.title}</h3>
                          <Badge variant="outline" className="mb-2">{resource.type}</Badge>
                          <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                          <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              {resource.type.includes("PDF") || resource.type.includes("Template") ? "Download" : "Access"}
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-12 bg-muted/30 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Need More Resources?</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Our team is constantly creating new guides and templates to help you get the most out of your skill swapping experience.
                </p>
                <Button>
                  Request a Resource
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Blog;
