import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getProfileData, saveProfileData } from "../services/profile.service";
import { getCurrentUserProfile, updateProfile, uploadAvatar } from "../services/profiles";
import { useAvatarDisplay, useAvatarUpload } from "../hooks/useAvatarDisplay";
import { useProfileUpdateNotification } from "../hooks/useDashboardRefresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Camera, Upload, X, Plus, Loader2 } from "lucide-react";

const ProfileEdit = () => {
  console.log('🔄 ProfileEdit - Component rendering...');
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { avatarUrl, fallbackAvatar, userInitials } = useAvatarDisplay();
  const { uploadAvatar: uploadAvatarFile, isUploading: isUploadingAvatar, uploadError } = useAvatarUpload();
  const { notifyProfileUpdate, notifyAvatarUpdate } = useProfileUpdateNotification();
  const [isLoading, setIsLoading] = useState(false);
  
  // Profile data state
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [customLearningSkillInput, setCustomLearningSkillInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Available skills (same as ProfileCreate)
  const availableSkills = [
    "Web Development", "Photography", "Fitness Training", "Digital Marketing",
    "Graphic Design", "Video Editing", "UI/UX Design", "Content Writing",
    "Mobile App Development", "Cooking Classes", "Language Teaching", "Career Coaching",
    "Music Lessons", "Financial Planning", "Gardening", "Interior Design"
  ];

  // Load existing profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoadingProfile(true);
        console.log('🔄 ProfileEdit - Component mounted, loading profile data...');
        console.log('🔄 ProfileEdit - User from context:', user);

        // Test authentication first
        const token = localStorage.getItem('access_token');
        console.log('🔑 ProfileEdit - Access token exists:', !!token);
        console.log('🔑 ProfileEdit - Token length:', token?.length || 0);

        // Fetch current profile data from backend
        console.log('🔄 ProfileEdit - Calling getCurrentUserProfile...');
        const profileData = await getCurrentUserProfile();
        console.log('📊 ProfileEdit - Backend profile data received:', profileData);

        // Set form data from backend
        setFirstName(profileData.first_name || "");
        setLastName(profileData.last_name || "");
        setBio(profileData.bio || "");
        setLocation(profileData.location || "");
        setProfilePhoto(profileData.avatar || `https://i.pravatar.cc/150?u=${profileData.id}`);

        // Load localStorage data as fallback for skills (until we have backend skills)
        const localProfileData = getProfileData();
        if (localProfileData) {
          setSelectedSkills(localProfileData.selectedSkills || []);
          setLearningSkills(localProfileData.learningSkills || []);
        }

        console.log('✅ ProfileEdit - Data loading completed successfully');
        setAuthStatus('✅ Profile loaded successfully - Ready for avatar upload');

      } catch (error) {
        console.error('❌ ProfileEdit - Error loading profile data:', error);
        setAuthStatus(`❌ Error loading profile: ${error}`);
        // Fallback to localStorage and AuthContext data
        const localProfileData = getProfileData();
        if (user) {
          console.log('🔄 ProfileEdit - Using fallback data from user context');
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setProfilePhoto(user.avatar || localProfileData?.avatar || "https://i.pravatar.cc/150?img=32");
        }
        if (localProfileData) {
          console.log('🔄 ProfileEdit - Using fallback data from localStorage');
          setBio(localProfileData.bio || "");
          setLocation(localProfileData.location || "");
          setSelectedSkills(localProfileData.selectedSkills || []);
          setLearningSkills(localProfileData.learningSkills || []);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // Always load data on mount
    loadProfileData();
  }, []); // Empty dependency array to run only on mount

  // Photo upload handler using the new avatar sync system
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📸 Photo upload started:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Check authentication before upload
      const token = localStorage.getItem('access_token');
      console.log('🔑 Avatar upload - Token check:', {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        user: user
      });

      try {
        // Upload avatar using the new sync system
        console.log('🔄 Starting avatar upload via useAvatarUpload hook...');
        const uploadedAvatarUrl = await uploadAvatarFile(file);

        if (uploadedAvatarUrl) {
          console.log('✅ Avatar uploaded and synchronized successfully:', uploadedAvatarUrl);
          // The avatar will be automatically updated across all components
          // via the avatar sync service

          // Also notify dashboard of avatar update
          await notifyAvatarUpdate(uploadedAvatarUrl);
        } else {
          console.warn('⚠️ Avatar upload returned null/undefined URL');
        }
      } catch (error) {
        console.error('❌ Avatar upload failed:', error);
        alert(`Avatar upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Clear the input to allow re-uploading the same file
    event.target.value = '';
  };

  // Skill management functions
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

  const addCustomSkill = () => {
    const trimmedSkill = customSkillInput.trim();
    if (trimmedSkill && !selectedSkills.includes(trimmedSkill)) {
      setSelectedSkills([...selectedSkills, trimmedSkill]);
      setCustomSkillInput("");
    }
  };

  const addCustomLearningSkill = () => {
    const trimmedSkill = customLearningSkillInput.trim();
    if (trimmedSkill && !learningSkills.includes(trimmedSkill)) {
      setLearningSkills([...learningSkills, trimmedSkill]);
      setCustomLearningSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const removeLearningSkill = (skill: string) => {
    setLearningSkills(learningSkills.filter(s => s !== skill));
  };

  // Save profile changes
  const handleSave = async () => {
    console.log('🚀 Starting profile save process...');
    console.log('📝 Current form data:', {
      firstName,
      lastName,
      bio,
      location,
      selectedSkills,
      learningSkills,
      profilePhoto,
      uploadedFile: uploadedFile ? {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type
      } : null
    });

    setIsLoading(true);

    try {
      // Prepare update data
      const updateData: any = {
        email: user?.email, // Include email to satisfy backend validation
        first_name: firstName,
        last_name: lastName,
        bio,
        location,
      };

      // Add avatar if a new file was uploaded
      if (uploadedFile) {
        console.log('📤 Adding avatar file to update data:', {
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          fileType: uploadedFile.type
        });
        updateData.avatar = uploadedFile;
      }

      console.log('💾 Updating profile via backend API...');
      console.log('📋 Update data being sent:', {
        ...updateData,
        avatar: updateData.avatar ? `File: ${updateData.avatar.name}` : 'No avatar'
      });

      const updatedProfile = await updateProfile(updateData);
      console.log('✅ Backend update successful:', updatedProfile);

      // Check if avatar was actually updated
      if (uploadedFile && updatedProfile.avatar) {
        console.log('✅ Avatar successfully uploaded to backend:', updatedProfile.avatar);
      } else if (uploadedFile && !updatedProfile.avatar) {
        console.warn('⚠️ Avatar file was sent but not saved in backend');
      }

      // Save skills to localStorage (until backend skills are implemented)
      const localProfileData = {
        avatar: updatedProfile.avatar || profilePhoto,
        firstName,
        lastName,
        bio,
        location,
        selectedSkills,
        learningSkills,
      };
      saveProfileData(localProfileData);

      // Update AuthContext with new data
      const authUpdateData = {
        firstName,
        lastName,
        avatar: updatedProfile.avatar || profilePhoto,
      };
      console.log('🔄 Updating AuthContext with:', authUpdateData);
      updateUser(authUpdateData);

      console.log('✅ Profile save completed successfully!');
      setSaveSuccess(true);

      // Notify dashboard of profile update
      await notifyProfileUpdate();

      // Show success message briefly before navigating
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      console.error('❌ Error saving profile:', error);

      // Log detailed error information
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }

      // Show user-friendly error message
      alert(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Don't fallback to localStorage for avatar uploads - let user retry
      setSaveSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching profile data
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">Update your profile information and skills</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo & Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Upload a new profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={avatarUrl || fallbackAvatar} />
                      <AvatarFallback className="text-2xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="h-5 w-5 text-primary-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isUploadingAvatar}
                      />
                    </label>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Click the camera icon to upload a new photo
                  </p>
                  {uploadError && (
                    <p className="text-sm text-red-500 mt-2 text-center">
                      {uploadError}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                    />
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
                    placeholder="Tell others about yourself, your interests, and what you're passionate about..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills to Share */}
            <Card>
              <CardHeader>
                <CardTitle>Skills to Share</CardTitle>
                <CardDescription>What skills can you teach others?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Skills */}
                {selectedSkills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your Teaching Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedSkills.map((skill) => (
                        <Badge key={skill} variant="default" className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Skills */}
                <div className="space-y-2">
                  <Label>Available Skills</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableSkills.map((skill) => (
                      <Button
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSkill(skill)}
                        className="justify-start"
                      >
                        {selectedSkills.includes(skill) ? "✓" : "+"} {skill}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Skill */}
                <div className="space-y-2">
                  <Label>Add Custom Skill</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      placeholder="Enter a skill not listed above"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                    />
                    <Button
                      variant="outline"
                      onClick={addCustomSkill}
                      disabled={!customSkillInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills to Learn */}
            <Card>
              <CardHeader>
                <CardTitle>Skills to Learn</CardTitle>
                <CardDescription>What skills would you like to learn?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Learning Skills */}
                {learningSkills.length > 0 && (
                  <div className="space-y-2">
                    <Label>Your Learning Goals</Label>
                    <div className="flex flex-wrap gap-2">
                      {learningSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeLearningSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Skills */}
                <div className="space-y-2">
                  <Label>Available Skills</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableSkills.map((skill) => (
                      <Button
                        key={skill}
                        variant={learningSkills.includes(skill) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleLearningSkill(skill)}
                        className="justify-start"
                      >
                        {learningSkills.includes(skill) ? "✓" : "+"} {skill}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Learning Skill */}
                <div className="space-y-2">
                  <Label>Add Custom Learning Goal</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customLearningSkillInput}
                      onChange={(e) => setCustomLearningSkillInput(e.target.value)}
                      placeholder="Enter a skill you want to learn"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomLearningSkill()}
                    />
                    <Button
                      variant="outline"
                      onClick={addCustomLearningSkill}
                      disabled={!customLearningSkillInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? "Saving..." : saveSuccess ? "Saved! ✓" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
