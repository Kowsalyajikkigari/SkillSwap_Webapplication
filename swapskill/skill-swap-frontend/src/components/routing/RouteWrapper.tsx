import React, { Suspense } from 'react';

const LoadingFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      <p className="text-sm text-muted-foreground">Loading page...</p>
    </div>
  </div>
);

interface RouteWrapperProps {
  children: React.ReactNode;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({ children }) => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};
