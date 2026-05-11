import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { saveProfileData } from "../services/profile.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const ProfileCreate = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);

  // Custom skill input states
  const [customSkillInput, setCustomSkillInput] = useState<string>("");
  const [customLearningSkillInput, setCustomLearningSkillInput] = useState<string>("");
  const [skillError, setSkillError] = useState<string>("");
  const [learningSkillError, setLearningSkillError] = useState<string>("");

  // Photo upload state
  const [profilePhoto, setProfilePhoto] = useState<string>("https://i.pravatar.cc/150?img=32");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [photoError, setPhotoError] = useState<string>("");
  
  const availableSkills = [
    "Graphic Design", "Web Development", "Photography", "Video Editing", 
    "Content Writing", "Digital Marketing", "UI/UX Design", "Mobile App Development",
    "Language Teaching", "Music Lessons", "Cooking Classes", "Fitness Training",
    "Financial Planning", "Career Coaching", "Interior Design", "Gardening"
  ];

  const handleNext = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(step + 1);
      setProgress(progress + 25);
    }, 500);
  };

  const handlePrevious = () => {
    setStep(step - 1);
    setProgress(progress - 25);
  };

  const handleSubmit = () => {
    setIsLoading(true);

    // Save profile data including the uploaded photo
    setTimeout(() => {
      // Save comprehensive profile data to localStorage
      const profileData = {
        avatar: profilePhoto !== "https://i.pravatar.cc/150?img=32" ? profilePhoto : undefined,
        selectedSkills: selectedSkills,
        learningSkills: learningSkills,
        // Add other form data here as needed
      };

      // Save to profile service
      saveProfileData(profileData);

      // Update user data in AuthContext with the profile picture
      updateUser({
        avatar: profileData.avatar,
      });

      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleLearningSkill = (skill: string) => {
    if (learningSkills.includes(skill)) {
      setLearningSkills(learningSkills.filter(s => s !== skill));
    } else {
      setLearningSkills([...learningSkills, skill]);
    }
  };

  // Add custom skill to teaching skills
  const addCustomSkill = () => {
    const trimmedSkill = customSkillInput.trim();
    setSkillError(""); // Clear previous errors

    if (!trimmedSkill) {
      setSkillError("Please enter a skill name");
      return;
    }

    if (selectedSkills.includes(trimmedSkill)) {
      setSkillError("This skill is already added");
      return;
    }

    // Check if it's already in available skills (case insensitive)
    const isInAvailableSkills = availableSkills.some(
      skill => skill.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (isInAvailableSkills) {
      setSkillError("This skill is available in the list above");
      return;
    }

    setSelectedSkills([...selectedSkills, trimmedSkill]);
    setCustomSkillInput(""); // Clear input after adding
  };

  // Add custom skill to learning skills
  const addCustomLearningSkill = () => {
    const trimmedSkill = customLearningSkillInput.trim();
    setLearningSkillError(""); // Clear previous errors

    if (!trimmedSkill) {
      setLearningSkillError("Please enter a skill name");
      return;
    }

    if (learningSkills.includes(trimmedSkill)) {
      setLearningSkillError("This skill is already added");
      return;
    }

    // Check if it's already in available skills (case insensitive)
    const isInAvailableSkills = availableSkills.some(
      skill => skill.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (isInAvailableSkills) {
      setLearningSkillError("This skill is available in the list above");
      return;
    }

    setLearningSkills([...learningSkills, trimmedSkill]);
    setCustomLearningSkillInput(""); // Clear input after adding
  };

  // Handle Enter key press for custom skills
  const handleCustomSkillKeyPress = (e: React.KeyboardEvent, isLearning: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isLearning) {
        addCustomLearningSkill();
      } else {
        addCustomSkill();
      }
    }
  };

  // Process file for photo upload
  const processPhotoFile = (file: File) => {
    // Clear previous errors
    setPhotoError("");

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('File size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);

    // Create a FileReader to preview the image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProfilePhoto(e.target.result as string);
        setIsUploadingPhoto(false);
        setPhotoError(""); // Clear any errors on success
      }
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      setPhotoError('Failed to read the image file');
    };
    reader.readAsDataURL(file);
  };

  // Photo upload handler
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processPhotoFile(file);
    }
  };

  // Trigger file input click
  const triggerPhotoUpload = () => {
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    fileInput?.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processPhotoFile(file);
      } else {
        setPhotoError('Please drop an image file (JPG, PNG, GIF, etc.)');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Your Profile</h1>
          <p className="text-muted-foreground mt-2">Complete your profile to start swapping skills</p>
        </div>
        
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>Basic Info</span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>Skills to Share</span>
            <span className={step >= 3 ? "text-primary font-medium" : ""}>Skills to Learn</span>
            <span className={step >= 4 ? "text-primary font-medium" : ""}>Preferences</span>
          </div>
        </div>
        
        <Card className="border shadow-lg">
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about yourself so others can get to know you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className={`relative cursor-pointer transition-all duration-200 ${
                      isDragOver ? 'scale-105 ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={triggerPhotoUpload}
                  >
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profilePhoto} />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                    {isDragOver && (
                      <div className="absolute inset-0 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary font-medium">Drop photo</span>
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <div className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerPhotoUpload}
                      disabled={isUploadingPhoto}
                    >
                      {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click or drag & drop an image (max 5MB)
                    </p>
                    {photoError && (
                      <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded">
                        {photoError}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="Jane" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="janedoe" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select defaultValue="us">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    placeholder="Tell others about yourself, your background, and your interests"
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleNext} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Next"}
                </Button>
              </CardFooter>
            </>
          )}
          
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Skills to Share</CardTitle>
                <CardDescription>
                  Select the skills you can teach or share with others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                        {skill}
                        <button 
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleSkill(skill)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Available Skills</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableSkills.map(skill => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`skill-${skill}`} 
                            checked={selectedSkills.includes(skill)}
                            onCheckedChange={() => toggleSkill(skill)}
                          />
                          <label 
                            htmlFor={`skill-${skill}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customSkill">Add Custom Skill</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="customSkill"
                        placeholder="Enter a skill not listed above"
                        value={customSkillInput}
                        onChange={(e) => {
                          setCustomSkillInput(e.target.value);
                          setSkillError(""); // Clear error when typing
                        }}
                        onKeyPress={(e) => handleCustomSkillKeyPress(e, false)}
                        className={skillError ? "border-red-500" : ""}
                      />
                      <Button
                        variant="outline"
                        onClick={addCustomSkill}
                        disabled={!customSkillInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    {skillError && (
                      <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded">
                        {skillError}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="skillDescription">Describe Your Experience</Label>
                    <Textarea 
                      id="skillDescription" 
                      placeholder="Briefly describe your experience with these skills"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Next"}
                </Button>
              </CardFooter>
            </>
          )}
          
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Skills to Learn</CardTitle>
                <CardDescription>
                  Select the skills you want to learn from others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {learningSkills.map(skill => (
                      <Badge key={skill} variant="outline" className="px-3 py-1 text-sm">
                        {skill}
                        <button 
                          className="ml-2 text-muted-foreground hover:text-foreground"
                          onClick={() => toggleLearningSkill(skill)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Available Skills</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableSkills.map(skill => (
                        <div key={`learn-${skill}`} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`learn-${skill}`} 
                            checked={learningSkills.includes(skill)}
                            onCheckedChange={() => toggleLearningSkill(skill)}
                          />
                          <label 
                            htmlFor={`learn-${skill}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customLearningSkill">Add Custom Skill</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="customLearningSkill"
                        placeholder="Enter a skill not listed above"
                        value={customLearningSkillInput}
                        onChange={(e) => {
                          setCustomLearningSkillInput(e.target.value);
                          setLearningSkillError(""); // Clear error when typing
                        }}
                        onKeyPress={(e) => handleCustomSkillKeyPress(e, true)}
                        className={learningSkillError ? "border-red-500" : ""}
                      />
                      <Button
                        variant="outline"
                        onClick={addCustomLearningSkill}
                        disabled={!customLearningSkillInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    {learningSkillError && (
                      <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded">
                        {learningSkillError}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="learningGoals">Your Learning Goals</Label>
                    <Textarea 
                      id="learningGoals" 
                      placeholder="What do you hope to achieve by learning these skills?"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Next"}
                </Button>
              </CardFooter>
            </>
          )}
          
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Preferences & Settings</CardTitle>
                <CardDescription>
                  Set your preferences for skill exchanges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Exchange Preferences</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="virtual" defaultChecked />
                        <label htmlFor="virtual" className="text-sm font-medium leading-none">
                          Virtual (online) exchanges
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="inPerson" defaultChecked />
                        <label htmlFor="inPerson" className="text-sm font-medium leading-none">
                          In-person exchanges
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="weekdays" defaultChecked />
                        <label htmlFor="weekdays" className="text-sm font-medium leading-none">
                          Weekdays
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="weekends" defaultChecked />
                        <label htmlFor="weekends" className="text-sm font-medium leading-none">
                          Weekends
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="mornings" />
                        <label htmlFor="mornings" className="text-sm font-medium leading-none">
                          Mornings
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="afternoons" defaultChecked />
                        <label htmlFor="afternoons" className="text-sm font-medium leading-none">
                          Afternoons
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="evenings" defaultChecked />
                        <label htmlFor="evenings" className="text-sm font-medium leading-none">
                          Evenings
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Privacy Settings</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="showEmail" />
                        <label htmlFor="showEmail" className="text-sm font-medium leading-none">
                          Show my email to other members
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="showPhone" />
                        <label htmlFor="showPhone" className="text-sm font-medium leading-none">
                          Show my phone number to other members
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="profileVisibility" defaultChecked />
                        <label htmlFor="profileVisibility" className="text-sm font-medium leading-none">
                          Make my profile visible in search results
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Completing Setup..." : "Complete Setup"}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfileCreate;
