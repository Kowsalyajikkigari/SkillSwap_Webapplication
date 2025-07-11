/**
 * Skills Page
 *
 * This page demonstrates the integration between the React frontend
 * and Django backend for skills management.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, GraduationCap, CheckCircle, XCircle } from "lucide-react";

const Skills: React.FC = () => {
  const [apiStatus, setApiStatus] = useState({
    backend: 'checking',
    auth: 'checking',
    skills: 'checking'
  });

  // Test API connectivity
  useEffect(() => {
    const testAPI = async () => {
      // Test backend connectivity with public endpoints
      try {
        const response = await fetch('http://127.0.0.1:8000/api/skills/categories/');
        if (response.ok || response.status === 401) {
          setApiStatus(prev => ({ ...prev, backend: 'connected' }));
        } else {
          setApiStatus(prev => ({ ...prev, backend: 'error' }));
        }
      } catch (error) {
        setApiStatus(prev => ({ ...prev, backend: 'error' }));
      }

      // Test auth endpoints
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
          method: 'OPTIONS'
        });
        setApiStatus(prev => ({ ...prev, auth: response.ok ? 'connected' : 'error' }));
      } catch (error) {
        setApiStatus(prev => ({ ...prev, auth: 'error' }));
      }

      // Test skills endpoints with OPTIONS (doesn't require auth)
      try {
        const response = await fetch('http://127.0.0.1:8000/api/skills/teaching/', {
          method: 'OPTIONS'
        });
        setApiStatus(prev => ({ ...prev, skills: response.ok ? 'connected' : 'error' }));
      } catch (error) {
        setApiStatus(prev => ({ ...prev, skills: 'error' }));
      }
    };

    testAPI();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Skills Integration Test</h1>
                <p className="text-gray-600">Testing frontend-backend connectivity</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* API Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 API Connectivity Test
            </CardTitle>
            <CardDescription>
              Testing connection to Django backend APIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Backend Server</h3>
                  <p className="text-sm text-gray-600">http://127.0.0.1:8000</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(apiStatus.backend)}
                  <span className="text-sm font-medium">
                    {apiStatus.backend === 'connected' ? 'Connected' :
                     apiStatus.backend === 'error' ? 'Error' : 'Checking...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Authentication API</h3>
                  <p className="text-sm text-gray-600">/api/auth/</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(apiStatus.auth)}
                  <span className="text-sm font-medium">
                    {apiStatus.auth === 'connected' ? 'Connected' :
                     apiStatus.auth === 'error' ? 'Error' : 'Checking...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Skills API</h3>
                  <p className="text-sm text-gray-600">/api/skills/</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(apiStatus.skills)}
                  <span className="text-sm font-medium">
                    {apiStatus.skills === 'connected' ? 'Connected' :
                     apiStatus.skills === 'error' ? 'Error' : 'Checking...'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🧪 Test Integration</CardTitle>
            <CardDescription>
              Test the authentication and skills management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/register">
                <Button className="w-full gap-2">
                  <BookOpen className="h-4 w-4" />
                  Test Registration
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Test Login
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Integration Status</CardTitle>
            <CardDescription>
              Current status of your SkillSwap application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-700">✅ Working Components:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    React Frontend (Port 3001)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Django Backend (Port 8000)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    PostgreSQL Database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    API Endpoints
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    CORS Configuration
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-blue-700">🔗 Available Endpoints:</h4>
                <ul className="space-y-1 text-sm font-mono">
                  <li>POST /api/auth/register/</li>
                  <li>POST /api/auth/login/</li>
                  <li>GET /api/skills/teaching/</li>
                  <li>POST /api/skills/teaching/</li>
                  <li>GET /api/skills/learning/</li>
                  <li>POST /api/skills/learning/</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Skills;
