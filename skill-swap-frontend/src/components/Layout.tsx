import React, { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Calendar, MessageCircle, Search, Settings, User, LogIn, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import { addCacheBusting } from "../services/profiles";
import NotificationBadge from "./NotificationBadge";
import ProfileDropdown from "./ProfileDropdown";
import WebSocketStatus from "./WebSocketStatus";
import { Toaster } from "./ui/sonner";
import { useLoading } from "../contexts/LoadingContext";
import { Progress } from "./ui/progress";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress(prev => {
          const next = prev + 10;
          if (next >= 90) {
            clearInterval(timer);
            return 90;
          }
          return next;
        });
      }, 300);
      return () => clearInterval(timer);
    } else {
      setProgress(100);
      const timer = setTimeout(() => setProgress(0), 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Helper function to determine if a link is active
  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    // Handle exact matches and sub-routes
    if (location.pathname === path) {
      return true;
    }

    // Handle sub-routes (e.g., /dashboard/settings should highlight /dashboard)
    if (location.pathname.startsWith(path + '/')) {
      return true;
    }

    return false;
  };

  // Helper function to get active link classes
  const getActiveLinkClasses = (path: string) => {
    return cn(
      "text-muted-foreground hover:text-foreground transition-all duration-200 relative",
      isActiveLink(path) && "text-foreground font-semibold after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full after:animate-in after:slide-in-from-left-full after:duration-300"
    );
  };

  // Helper function to get mobile active link classes
  const getMobileActiveLinkClasses = (path: string) => {
    return cn(
      "flex items-center space-x-2 py-2 transition-all duration-200 rounded-md px-2",
      isActiveLink(path)
        ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {progress > 0 && (
        <Progress 
          value={progress} 
          className="fixed top-0 left-0 right-0 z-50 h-0.5 transition-all"
        />
      )}
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className={cn(
            "flex items-center space-x-2 transition-opacity",
            isActiveLink('/') ? "opacity-100" : "opacity-90 hover:opacity-100"
          )}>
            <span className="text-2xl font-bold gradient-text">SkillSwap</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/dashboard" className={getActiveLinkClasses('/dashboard')}>Dashboard</Link>
                <Link to="/search" className={getActiveLinkClasses('/search')}>Find Skills</Link>
                <Link to="/sessions" className={getActiveLinkClasses('/sessions')}>Sessions</Link>
                <div className="flex items-center space-x-3">
                  <WebSocketStatus showText={false} className="mr-1" />
                  <NotificationBadge className="rounded-full" />
                  <ProfileDropdown />
                </div>
              </>
            ) : (
              <>
                <Link to="/search" className={getActiveLinkClasses('/search')}>Find Skills</Link>
                <Button asChild variant="ghost" className={getActiveLinkClasses('/login')}>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <div className="flex flex-col space-y-4 px-4 py-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 py-2 border-b">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage
                        src={addCacheBusting(user.avatar) || "https://i.pravatar.cc/150?img=1"}
                        alt={user.firstName || user.email}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className={getMobileActiveLinkClasses('/dashboard')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/search"
                    className={getMobileActiveLinkClasses('/search')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Search className="h-5 w-5" />
                    <span>Find Skills</span>
                  </Link>
                  <Link
                    to="/sessions"
                    className={getMobileActiveLinkClasses('/sessions')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Sessions</span>
                  </Link>
                  <Link
                    to="/messages"
                    className={getMobileActiveLinkClasses('/messages')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Messages</span>
                  </Link>
                  <Link
                    to="/profile"
                    className={getMobileActiveLinkClasses('/profile')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    <span>View Profile</span>
                  </Link>
                  <Link
                    to="/profile/edit"
                    className={getMobileActiveLinkClasses('/profile/edit')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className={getMobileActiveLinkClasses('/settings')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 py-2 text-left w-full border-t pt-4 text-red-600 hover:bg-red-50 rounded-md px-2 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/search"
                    className={getMobileActiveLinkClasses('/search')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Search className="h-5 w-5" />
                    <span>Find Skills</span>
                  </Link>
                  <Button asChild variant="ghost" className={getMobileActiveLinkClasses('/login')}>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </Link>
                  </Button>
                  <Button asChild className={getMobileActiveLinkClasses('/register')}>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-5 w-5" />
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {children}
      </main>

      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-lg font-semibold gradient-text">SkillSwap</span>
              <p className="text-sm text-muted-foreground mt-1">Share knowledge, grow together.</p>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-semibold mb-2">Platform</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
                  <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground">Find Skills</Link>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-semibold mb-2">Resources</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link>
                  <Link to="/guide" className="text-sm text-muted-foreground hover:text-foreground">How It Works</Link>
                  <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">Support</Link>
                </div>
              </div>

              <div className="flex flex-col items-center md:items-start">
                <h3 className="font-semibold mb-2">Legal</h3>
                <div className="flex flex-col space-y-2">
                  <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
                  <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
                  <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground">Cookies</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-4 text-center md:text-left">
            <p className="text-sm text-muted-foreground">© 2023 SkillSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

export default Layout;
