import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Edit3,
  Bell,
  HelpCircle,
  Shield,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { useAvatarDisplay } from '../hooks/useAvatarDisplay';
import { getProfileCompletionStatus, getCompletionMessage, getCompletionColor } from '../services/profile-completion.service';

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const { avatarUrl, fallbackAvatar, userInitials } = useAvatarDisplay();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Load profile completion status
  useEffect(() => {
    const loadCompletionStatus = async () => {
      if (user) {
        try {
          const status = await getProfileCompletionStatus();
          setCompletionStatus(status);
        } catch (error) {
          console.error('Error loading profile completion status:', error);
        }
      }
    };

    loadCompletionStatus();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  if (!user) {
    return null;
  }

  const userDisplayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Profile Button */}
      <Button
        variant="ghost"
        className="relative h-10 w-auto px-2 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="flex items-center space-x-2">
          {/* User Avatar */}
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
              <AvatarImage
                src={avatarUrl || fallbackAvatar}
                alt={userDisplayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          {/* User Name (hidden on mobile) */}
          <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">
            {user.firstName || 'User'}
          </span>
          
          {/* Dropdown Arrow */}
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 profile-dropdown-enter">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={avatarUrl || fallbackAvatar}
                  alt={userDisplayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userDisplayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Profile Completion Status */}
            {completionStatus && !completionStatus.is_complete && (
              <div className="mt-3 p-2 bg-orange-50 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-orange-700">Profile Completion</span>
                  <span className="text-xs text-orange-600">{completionStatus.completion_percentage}%</span>
                </div>
                <Progress
                  value={completionStatus.completion_percentage}
                  className="h-1.5 mb-1"
                />
                <Link
                  to="/profile/create"
                  className="text-xs text-orange-600 hover:text-orange-700 flex items-center"
                  onClick={handleMenuItemClick}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Complete your profile
                </Link>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* View Profile */}
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={handleMenuItemClick}
            >
              <User className="h-4 w-4 mr-3 text-gray-400" />
              View Profile
            </Link>

            {/* Edit Profile */}
            <Link
              to="/profile/edit"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={handleMenuItemClick}
            >
              <Edit3 className="h-4 w-4 mr-3 text-gray-400" />
              Edit Profile
            </Link>

            {/* Dashboard */}
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={handleMenuItemClick}
            >
              <Shield className="h-4 w-4 mr-3 text-gray-400" />
              Dashboard
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={handleMenuItemClick}
            >
              <Bell className="h-4 w-4 mr-3 text-gray-400" />
              Notifications
            </Link>

            {/* Settings */}
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={handleMenuItemClick}
            >
              <Settings className="h-4 w-4 mr-3 text-gray-400" />
              Settings
            </Link>

            {/* Help */}
            <Link
              to="/help"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={handleMenuItemClick}
            >
              <HelpCircle className="h-4 w-4 mr-3 text-gray-400" />
              Help & Support
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <LogOut className="h-4 w-4 mr-3 text-red-500" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
