import { Skeleton } from '@/components/ui/skeleton';

interface LogTableSkeletonProps {
  rows?: number;
}

export function LogTableSkeleton({ rows = 10 }: LogTableSkeletonProps) {
  return (
    <div className="space-y-2" data-testid="log-table-skeleton">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        <Skeleton className="h-4 w-[80px]" /> {/* Time */}
        <Skeleton className="h-4 w-[70px]" /> {/* Level */}
        <Skeleton className="h-4 w-[100px]" /> {/* Category */}
        <Skeleton className="h-4 w-[200px]" /> {/* Message */}
        <Skeleton className="h-4 w-[80px]" /> {/* User */}
        <Skeleton className="h-4 w-[60px]" /> {/* IP */}
      </div>
      
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-6 w-[70px] rounded-full" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      ))}
    </div>
  );
}
