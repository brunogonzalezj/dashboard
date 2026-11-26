import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#e8ebf0]',
        className
      )}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="dashboard-card space-y-3">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-1.5 w-full" />
    </div>
  );
}

export function ChartSkeleton({ height = 'h-[300px]' }: { height?: string }) {
  return (
    <div className="dashboard-card">
      <Skeleton className="h-5 w-48 mb-4" />
      <Skeleton className={`w-full ${height}`} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="dashboard-card p-0! overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}>
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <td key={colIdx}>
                    <Skeleton className="h-3 w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FilterSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="dashboard-card">
      <Skeleton className="h-3 w-16 mb-3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="dashboard-card space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function UploadCardSkeleton() {
  return (
    <div className="dashboard-card space-y-4">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
