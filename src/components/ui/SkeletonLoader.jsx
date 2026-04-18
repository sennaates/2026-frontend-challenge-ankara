// src/components/ui/SkeletonLoader.jsx
/**
 * Skeleton loading placeholder.
 * Props: count (number of cards to show), className
 */
function SkeletonCard() {
  return (
    <li
      className="relative pl-7 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-border"
    >
      <div className="absolute left-[-4px] top-3 w-2 h-2 rounded-full bg-border" />
      <div className="bg-card p-4 rounded-xl border border-border space-y-3 animate-pulse shadow-sm">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="h-4 w-20 bg-border/50 rounded" />
          <div className="h-3 w-28 bg-border/50 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-border/50 rounded" />
        <div className="h-3 w-full bg-border/50 rounded" />
        <div className="h-3 w-5/6 bg-border/50 rounded" />
        <div className="h-6 w-24 bg-border/50 rounded mt-2" />
      </div>
    </li>
  );
}

export default function SkeletonLoader({ count = 5 }) {
  return (
    <ul aria-label="Veriler yükleniyor" aria-busy="true" className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </ul>
  );
}
