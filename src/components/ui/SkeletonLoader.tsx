import type { ReactNode } from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonLoader({ 
  rows = 5, 
  columns = 6, 
  className = '' 
}: SkeletonLoaderProps): ReactNode {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-6 rounded-md animate-pulse"
              style={{ 
                backgroundColor: 'var(--border)',
                width: colIndex === 0 ? '200px' : '100px'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
