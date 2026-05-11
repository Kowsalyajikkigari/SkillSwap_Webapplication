import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, useEffect } from 'react';

// Import CSS
import "./App.css";
import "./index.css";

// Import Context Providers and Utils
import { LoadingProvider } from "./contexts/LoadingContext";
import { Toaster } from "./components/ui/toaster";
import { RouteWrapper } from "./components/routing/RouteWrapper";
import { clearInvalidTokens } from "./services/auth.service";
// Import backend test utility for debugging
import "./utils/backend-test";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));

const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const Settings = lazy(() => import("./pages/Settings"));
const Explore = lazy(() => import("./pages/Explore"));
const Sessions = lazy(() => import("./pages/Sessions"));
const SkillExchangeRequest = lazy(() => import("./components/sessions/SkillExchangeRequest"));
const Inbox = lazy(() => import("./pages/Inbox"));
const InboxRealTime = lazy(() => import("./pages/InboxRealTime"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FindSkills = lazy(() => import("./pages/FindSkills"));
const BookSession = lazy(() => import("./pages/BookSession"));
const Help = lazy(() => import("./pages/Help"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ProfileCreateWizard = lazy(() => import("./pages/ProfileCreateWizard"));

// Import Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { VoiceProvider } from "./contexts/VoiceContext";

// Import Layout and Auth Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProfileCompletionGuard from "./components/auth/ProfileCompletionGuard";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  // Clear invalid tokens on app initialization
  useEffect(() => {
    clearInvalidTokens();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <LoadingProvider>
          <AuthProvider>
            <WebSocketProvider>
              <VoiceProvider>
                <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<RouteWrapper><Index /></RouteWrapper>} />
                  <Route path="/search" element={<RouteWrapper><FindSkills /></RouteWrapper>} />
                  <Route path="/book/:providerId" element={<RouteWrapper><BookSession /></RouteWrapper>} />
                  <Route path="/login" element={<RouteWrapper><Login /></RouteWrapper>} />
                  <Route path="/register" element={<RouteWrapper><Register /></RouteWrapper>} />
                  <Route path="/forgot-password" element={<RouteWrapper><ForgotPassword /></RouteWrapper>} />
                  <Route path="/reset-password/:uid/:token" element={<RouteWrapper><ResetPassword /></RouteWrapper>} />
                  <Route path="/contact" element={<RouteWrapper><Contact /></RouteWrapper>} />
                  <Route path="/blog" element={<RouteWrapper><Blog /></RouteWrapper>} />

                  {/* Protected Application Pages */}
                  <Route path="/dashboard" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <ProfileCompletionGuard requireComplete={false}>
                          <Dashboard />
                        </ProfileCompletionGuard>
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/profile" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/profile/:id" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/profile/create" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <ProfileCreateWizard />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/profile/edit" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <ProfileEdit />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/settings" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/help" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Help />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/notifications" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/explore" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Explore />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/sessions" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Sessions />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/request/:userId" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <SkillExchangeRequest />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/inbox" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <InboxRealTime />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/inbox/:id" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Inbox />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/message/:id" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Inbox />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />
                  <Route path="/messages/new/:providerId" element={
                    <RouteWrapper>
                      <ProtectedRoute>
                        <Inbox />
                      </ProtectedRoute>
                    </RouteWrapper>
                  } />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
              <Toaster />
            </VoiceProvider>
          </WebSocketProvider>
        </AuthProvider>
        </LoadingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
