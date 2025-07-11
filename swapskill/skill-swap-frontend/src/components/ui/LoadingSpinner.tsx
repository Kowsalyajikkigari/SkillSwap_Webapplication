import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  const spinner = (
    <div className={cn(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      sizeClasses[size],
      colorClasses[color],
      className
    )}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2">
      {spinner}
      {text && (
        <p className={cn(
          'text-sm font-medium',
          colorClasses[color]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

// Skeleton loading components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="bg-gray-200 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      <div className="h-3 bg-gray-300 rounded w-full"></div>
    </div>
  </div>
);

export const SkeletonProfile: React.FC = () => (
  <div className="animate-pulse flex items-center space-x-4 p-4">
    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

// Progress indicators
interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
  showPercentage = false,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

// Loading states for different components
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ loading, children, className, disabled, onClick }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md",
      "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    disabled={loading || disabled}
    onClick={onClick}
  >
    {loading && (
      <LoadingSpinner size="sm" color="white" className="mr-2" />
    )}
    {children}
  </button>
);

export const LoadingOverlay: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  text?: string;
}> = ({ loading, children, text }) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        <LoadingSpinner size="lg" text={text} />
      </div>
    )}
  </div>
);

// Pulse animation for loading states
export const PulseLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex space-x-1", className)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
        style={{
          animationDelay: `${i * 0.2}s`,
          animationDuration: '1s'
        }}
      ></div>
    ))}
  </div>
);

// Typing indicator
export const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 text-gray-500">
    <span className="text-sm">Typing</span>
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        ></div>
      ))}
    </div>
  </div>
);

// Connection status indicator
export const ConnectionStatus: React.FC<{
  connected: boolean;
  className?: string;
}> = ({ connected, className }) => (
  <div className={cn("flex items-center space-x-2", className)}>
    <div
      className={cn(
        "w-2 h-2 rounded-full",
        connected ? "bg-green-500" : "bg-red-500"
      )}
    ></div>
    <span className="text-xs text-gray-600">
      {connected ? "Connected" : "Disconnected"}
    </span>
  </div>
);

// Loading states for specific components
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} className="h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonCard className="h-64" />
      <SkeletonCard className="h-64" />
    </div>
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="animate-pulse">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-300 rounded w-48"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);
