import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { uploadAvatar, getCurrentUserProfile } from '../../services/profiles';
import { runFullDiagnostic } from '../../utils/backend-test';

const AvatarUploadTest: React.FC = () => {
  const { user, updateUser, refreshUserData } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      console.log('🧪 Testing avatar upload with file:', selectedFile.name);
      
      // Test the upload
      const result = await uploadAvatar(selectedFile);
      
      console.log('✅ Upload successful:', result);
      setUploadResult(`Upload successful! Avatar URL: ${result.avatar}`);
      
      // Update auth context
      updateUser({ avatar: result.avatar });
      
      // Refresh user data
      await refreshUserData();
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const runDiagnostic = async () => {
    setRunningDiagnostic(true);
    try {
      const token = localStorage.getItem('access_token');
      const result = await runFullDiagnostic(token || undefined);
      setDiagnosticResult(result);
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setDiagnosticResult({
        overall: 'error',
        results: {},
        recommendations: ['Failed to run diagnostic']
      });
    } finally {
      setRunningDiagnostic(false);
    }
  };

  const testProfileFetch = async () => {
    try {
      console.log('🧪 Testing profile fetch...');
      const profile = await getCurrentUserProfile();
      console.log('✅ Profile fetch successful:', profile);
      setUploadResult(`Profile fetch successful! Current avatar: ${profile.avatar || 'None'}`);
    } catch (error) {
      console.error('❌ Profile fetch failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadError(errorMessage);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Avatar Upload Test
          </CardTitle>
          <CardDescription>
            Test avatar upload functionality and diagnose any issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current User Info */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Current User Info:</h4>
            <div className="text-sm space-y-1">
              <div>Email: {user?.email || 'Not logged in'}</div>
              <div>Current Avatar: {user?.avatar || 'None'}</div>
              <div>User ID: {user?.id || 'Unknown'}</div>
            </div>
          </div>

          {/* File Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Avatar Image:</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Avatar
                </>
              )}
            </Button>
            <Button variant="outline" onClick={testProfileFetch}>
              Test Profile Fetch
            </Button>
          </div>

          {/* Results */}
          {uploadResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{uploadResult}</AlertDescription>
            </Alert>
          )}

          {uploadError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Backend Diagnostic
          </CardTitle>
          <CardDescription>
            Test backend connectivity and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostic} 
            disabled={runningDiagnostic}
            variant="outline"
            className="w-full"
          >
            {runningDiagnostic ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostic...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Run Backend Diagnostic
              </>
            )}
          </Button>

          {diagnosticResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Overall Status:</span>
                <Badge 
                  variant={
                    diagnosticResult.overall === 'success' ? 'default' : 
                    diagnosticResult.overall === 'warning' ? 'secondary' : 'destructive'
                  }
                >
                  {diagnosticResult.overall.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">Test Results:</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Backend Connection:</span>
                    <Badge variant={diagnosticResult.results.backend?.isConnected ? 'default' : 'destructive'}>
                      {diagnosticResult.results.backend?.isConnected ? 'Connected' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Auth Endpoint:</span>
                    <Badge variant={diagnosticResult.results.auth?.isWorking ? 'default' : 'destructive'}>
                      {diagnosticResult.results.auth?.isWorking ? 'Working' : 'Failed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>CORS Configuration:</span>
                    <Badge variant={diagnosticResult.results.cors?.isConfigured ? 'default' : 'destructive'}>
                      {diagnosticResult.results.cors?.isConfigured ? 'Configured' : 'Issues'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">Recommendations:</h5>
                <ul className="text-sm space-y-1">
                  {diagnosticResult.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarUploadTest;
