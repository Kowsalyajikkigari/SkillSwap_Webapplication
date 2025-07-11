import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { uploadAvatar } from '../../services/profiles';
import { useAuth } from '../../contexts/AuthContext';
import { avatarSyncService } from '../../services/avatar-sync.service';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarUpdate,
  size = 'md',
  className = ''
}) => {
  const { user, refreshUserData } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('🔄 Starting avatar upload...');
      const result = await uploadAvatar(file);
      console.log('✅ Avatar upload successful:', result);

      // Notify avatar sync service
      if (result.avatar) {
        avatarSyncService.notifyAvatarUpdate(result.avatar);
      }

      // Refresh user data
      await refreshUserData();

      // Call callback if provided
      if (onAvatarUpdate && result.avatar) {
        onAvatarUpdate(result.avatar);
      }

      setPreviewUrl(null);
      console.log('✅ Avatar upload completed successfully');
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearError = () => {
    setUploadError(null);
  };

  const displayAvatar = previewUrl || currentAvatar || user?.avatar;
  const userName = user?.first_name || user?.email || 'User';

  return (
    <div className={`flex flex-col items-center space-y-3 ${className}`}>
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-2 border-border`}>
          <AvatarImage src={displayAvatar} alt={userName} />
          <AvatarFallback className="text-lg font-semibold">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
             onClick={handleButtonClick}>
          <Camera className="h-6 w-6 text-white" />
        </div>
        
        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Change Photo'}
      </Button>

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
          <span>{uploadError}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
