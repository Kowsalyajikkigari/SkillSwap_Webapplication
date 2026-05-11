
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PortfolioItem, Skill } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface SkillPortfolioProps {
  userSkills: Skill[];
  portfolioItems: PortfolioItem[];
  onAddPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'userId' | 'createdAt'>) => void;
}

const SkillPortfolio = ({ userSkills, portfolioItems, onAddPortfolioItem }: SkillPortfolioProps) => {
  const [open, setOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [itemType, setItemType] = useState<'video' | 'certificate' | 'project'>('video');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSkill || !title || (!url && !file)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // In a real implementation, we would upload the file here
    setTimeout(() => {
      const newItem = {
        skillId: selectedSkill,
        type: itemType,
        title,
        description,
        url: url || `https://example.com/uploads/${file?.name || 'file.pdf'}`,
      };
      
      onAddPortfolioItem(newItem);
      setIsUploading(false);
      setOpen(false);
      resetForm();
      
      toast({
        title: "Portfolio item added",
        description: "Your skill portfolio has been updated",
      });
    }, 1000);
  };

  const resetForm = () => {
    setSelectedSkill("");
    setItemType('video');
    setTitle("");
    setDescription("");
    setUrl("");
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Skill Portfolio</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">Add Portfolio Item</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add to Your Skill Portfolio</DialogTitle>
              <DialogDescription>
                Upload videos, certificates, or projects demonstrating your skills
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="skill">Skill</Label>
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {userSkills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Item Type</Label>
                <Select value={itemType} onValueChange={(value: 'video' | 'certificate' | 'project') => setItemType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., JavaScript Advanced Course Certification"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe this portfolio item"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                {itemType === 'video' ? (
                  <>
                    <Label htmlFor="url">Video URL</Label>
                    <Input 
                      id="url" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="YouTube or Vimeo URL"
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor="file">Upload File or Enter URL</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        id="url" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="URL (optional)"
                      />
                      <Input 
                        id="file" 
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Add to Portfolio"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {portfolioItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {portfolioItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{item.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.type === 'video' ? 'bg-blue-100 text-blue-600' : 
                      item.type === 'certificate' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </span>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  
                  {item.type === 'video' ? (
                    <div className="mt-3 aspect-video bg-muted/40 flex items-center justify-center rounded">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => window.open(item.url, '_blank')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="10 8 16 12 10 16 10 8" />
                        </svg>
                        Watch Video
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary" 
                        onClick={() => window.open(item.url || item.fileUrl, '_blank')}
                      >
                        View {item.type === 'certificate' ? 'Certificate' : 'Project'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-muted/10">
          <p className="text-muted-foreground">Your portfolio is empty. Add items to showcase your skills.</p>
        </div>
      )}
    </div>
  );
};

export default SkillPortfolio;
