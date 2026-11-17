import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-sm bg-[var(--rule)]/60', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
