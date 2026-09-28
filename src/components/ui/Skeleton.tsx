/**
 * Loading placeholders with a soft shimmer. Shapes match the real components,
 * so nothing jumps when the content arrives.
 *
 *   <Skeleton className="h-4 w-40" />     any block
 *   <SkeletonText lines={3} />            a paragraph
 *   <SkeletonCard />                      one ContentCard
 *   <SkeletonGrid count={8} />            a CardGrid of them
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`skeleton ${className}`} />;
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden className={`block space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={`h-3.5 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </span>
  );
}

export function SkeletonCard() {
  return (
    <div aria-hidden className="card flex gap-4 p-5">
      <Skeleton className="h-14 w-14 shrink-0 !rounded-full" />
      <div className="flex-1 space-y-2.5 pt-1">
        <Skeleton className="h-4 w-3/5" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

export function SkeletonImage({ className = "aspect-[4/3] w-full" }: { className?: string }) {
  return <Skeleton className={`!rounded-md ${className}`} />;
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
