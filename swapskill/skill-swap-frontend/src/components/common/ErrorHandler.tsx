import React from 'react';
import { AlertCircle, Wifi, Server, RefreshCw, LogIn } from 'lucide-react';

interface ErrorHandlerProps {
  error: Error | null;
  onRetry?: () => void;
  onLogin?: () => void;
  className?: string;
}

export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onLogin,
  className = ''
}) => {
  if (!error) return null;

  const getErrorDetails = (error: Error) => {
    const errorName = error.name || 'Error';
    const errorMessage = error.message || 'An unexpected error occurred';

    switch (errorName) {
      case 'ConnectionError':
        return {
          icon: <Server className="w-6 h-6 text-red-500" />,
          title: 'Backend Connection Failed',
          message: 'The server is not responding. Please ensure the backend is running.',
          actionText: 'Retry Connection',
          actionIcon: <RefreshCw className="w-4 h-4" />,
          showRetry: true,
          color: 'red'
        };

      case 'NetworkError':
        return {
          icon: <Wifi className="w-6 h-6 text-orange-500" />,
          title: 'Network Connection Issue',
          message: 'Please check your internet connection and try again.',
          actionText: 'Retry',
          actionIcon: <RefreshCw className="w-4 h-4" />,
          showRetry: true,
          color: 'orange'
        };

      case 'AuthenticationError':
      case 'Unauthorized':
        return {
          icon: <LogIn className="w-6 h-6 text-blue-500" />,
          title: 'Authentication Required',
          message: 'Please log in to access this feature.',
          actionText: 'Log In',
          actionIcon: <LogIn className="w-4 h-4" />,
          showLogin: true,
          color: 'blue'
        };

      case 'ValidationError':
        return {
          icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
          title: 'Validation Error',
          message: errorMessage,
          actionText: 'Try Again',
          actionIcon: <RefreshCw className="w-4 h-4" />,
          showRetry: true,
          color: 'yellow'
        };

      default:
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          title: 'Error',
          message: errorMessage,
          actionText: 'Try Again',
          actionIcon: <RefreshCw className="w-4 h-4" />,
          showRetry: true,
          color: 'red'
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {errorDetails.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {errorDetails.title}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {errorDetails.message}
          </p>
          
          <div className="flex space-x-3">
            {errorDetails.showRetry && onRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-${errorDetails.color}-600 hover:bg-${errorDetails.color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${errorDetails.color}-500 transition-colors`}
              >
                {errorDetails.actionIcon}
                <span className="ml-2">{errorDetails.actionText}</span>
              </button>
            )}
            
            {errorDetails.showLogin && onLogin && (
              <button
                onClick={onLogin}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {errorDetails.actionIcon}
                <span className="ml-2">{errorDetails.actionText}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for better error handling
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: any) => {
    console.error('Error caught by handler:', error);
    
    // Convert different error types to our standard format
    if (error?.response?.status === 401) {
      const authError = new Error('Please log in to access this feature.');
      authError.name = 'AuthenticationError';
      setError(authError);
    } else if (error?.response?.status === 400) {
      const validationError = new Error(
        error?.response?.data?.message || 
        'Please check your input and try again.'
      );
      validationError.name = 'ValidationError';
      setError(validationError);
    } else if (error?.code === 'ERR_NETWORK') {
      const networkError = new Error('Network connection failed. Please check your internet connection.');
      networkError.name = 'NetworkError';
      setError(networkError);
    } else if (error?.name) {
      setError(error);
    } else {
      const genericError = new Error(error?.message || 'An unexpected error occurred.');
      genericError.name = 'Error';
      setError(genericError);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};

export default ErrorHandler;
