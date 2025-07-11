import React, { Suspense } from 'react';
import { ProfileSkeleton, SkillCardSkeleton, SessionSkeleton, TableRowSkeleton } from './loading-skeletons';

interface SkeletonWrapperProps {
  type: 'profile' | 'skill' | 'session' | 'table';
  count?: number;
  children: React.ReactNode;
}

const getSkeletonComponent = (type: string) => {
  switch (type) {
    case 'profile':
      return ProfileSkeleton;
    case 'skill':
      return SkillCardSkeleton;
    case 'session':
      return SessionSkeleton;
    case 'table':
      return TableRowSkeleton;
    default:
      return SkillCardSkeleton;
  }
};

export const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({ 
  type, 
  count = 1, 
  children 
}) => {
  const SkeletonComponent = getSkeletonComponent(type);

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          {Array(count)
            .fill(null)
            .map((_, i) => (
              <SkeletonComponent key={i} />
            ))}
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
