/**
 * Backend Connection Test Utility
 * 
 * This utility helps test the connection to the Django backend
 * and diagnose avatar upload issues.
 */

import { API_BASE_URL } from '../config/api.config';

export const testBackendConnection = async (): Promise<{
  isConnected: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('🔍 Testing backend connection...');
    console.log('🔗 API Base URL:', API_BASE_URL);
    
    // Test basic connection to Django backend
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/admin/`, {
      method: 'GET',
      mode: 'cors',
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 302 || response.status === 200) {
      return {
        isConnected: true,
        message: 'Backend is running and accessible',
        details: {
          status: response.status,
          url: `${API_BASE_URL.replace('/api', '')}/admin/`
        }
      };
    } else {
      return {
        isConnected: false,
        message: `Backend responded with status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    }
  } catch (error) {
    console.error('❌ Backend connection test failed:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        isConnected: false,
        message: 'Cannot connect to backend - server may not be running',
        details: {
          error: error.message,
          expectedUrl: API_BASE_URL
        }
      };
    }
    
    return {
      isConnected: false,
      message: 'Unknown connection error',
      details: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};

export const testAuthEndpoint = async (token?: string): Promise<{
  isWorking: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('🔍 Testing auth endpoint...');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/user/profile/`, {
      method: 'GET',
      headers,
      mode: 'cors',
    });
    
    console.log('📡 Auth endpoint response status:', response.status);
    
    if (response.status === 401) {
      return {
        isWorking: true,
        message: 'Auth endpoint is working (requires authentication)',
        details: {
          status: response.status,
          message: 'Authentication required'
        }
      };
    } else if (response.status === 200) {
      const data = await response.json();
      return {
        isWorking: true,
        message: 'Auth endpoint is working and user is authenticated',
        details: {
          status: response.status,
          userData: data
        }
      };
    } else {
      return {
        isWorking: false,
        message: `Auth endpoint returned unexpected status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText
        }
      };
    }
  } catch (error) {
    console.error('❌ Auth endpoint test failed:', error);
    
    return {
      isWorking: false,
      message: 'Auth endpoint test failed',
      details: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};

export const testCorsConfiguration = async (): Promise<{
  isConfigured: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('🔍 Testing CORS configuration...');
    
    const response = await fetch(`${API_BASE_URL}/auth/user/profile/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
      mode: 'cors',
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Credentials': response.headers.get('Access-Control-Allow-Credentials'),
    };
    
    console.log('📡 CORS headers:', corsHeaders);
    
    const hasOrigin = corsHeaders['Access-Control-Allow-Origin'] === 'http://localhost:3000' || 
                     corsHeaders['Access-Control-Allow-Origin'] === '*';
    const hasMethods = corsHeaders['Access-Control-Allow-Methods']?.includes('PUT');
    const hasHeaders = corsHeaders['Access-Control-Allow-Headers']?.includes('authorization');
    
    if (hasOrigin && hasMethods && hasHeaders) {
      return {
        isConfigured: true,
        message: 'CORS is properly configured',
        details: corsHeaders
      };
    } else {
      return {
        isConfigured: false,
        message: 'CORS configuration may have issues',
        details: {
          corsHeaders,
          checks: {
            hasOrigin,
            hasMethods,
            hasHeaders
          }
        }
      };
    }
  } catch (error) {
    console.error('❌ CORS test failed:', error);
    
    return {
      isConfigured: false,
      message: 'CORS test failed',
      details: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};

export const runFullDiagnostic = async (token?: string): Promise<{
  overall: 'success' | 'warning' | 'error';
  results: {
    backend: Awaited<ReturnType<typeof testBackendConnection>>;
    auth: Awaited<ReturnType<typeof testAuthEndpoint>>;
    cors: Awaited<ReturnType<typeof testCorsConfiguration>>;
  };
  recommendations: string[];
}> => {
  console.log('🔍 Running full backend diagnostic...');
  
  const results = {
    backend: await testBackendConnection(),
    auth: await testAuthEndpoint(token),
    cors: await testCorsConfiguration(),
  };
  
  const recommendations: string[] = [];
  let overall: 'success' | 'warning' | 'error' = 'success';
  
  if (!results.backend.isConnected) {
    overall = 'error';
    recommendations.push('Start the Django backend server: python manage.py runserver 127.0.0.1:8000');
  }
  
  if (!results.auth.isWorking) {
    overall = 'error';
    recommendations.push('Check Django auth endpoints and URL configuration');
  }
  
  if (!results.cors.isConfigured) {
    if (overall !== 'error') overall = 'warning';
    recommendations.push('Check CORS configuration in Django settings.py');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All systems are working correctly!');
  }
  
  console.log('✅ Diagnostic complete:', { overall, results, recommendations });
  
  return {
    overall,
    results,
    recommendations
  };
};

// Export for use in browser console
(window as any).backendTest = {
  testBackendConnection,
  testAuthEndpoint,
  testCorsConfiguration,
  runFullDiagnostic
};
