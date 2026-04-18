// src/components/ui/SkeletonLoader.jsx
/**
 * Skeleton loading placeholder.
 * Props: count (number of cards to show), className
 */
function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="relative pl-7 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-800"
    >
      <div className="absolute left-[-4px] top-3 w-2 h-2 rounded-full bg-slate-800" />
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-4 w-20 bg-slate-800 rounded" />
          <div className="h-3 w-28 bg-slate-800 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-slate-800 rounded" />
        <div className="h-3 w-full bg-slate-800 rounded" />
        <div className="h-3 w-5/6 bg-slate-800 rounded" />
        <div className="h-6 w-24 bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export default function SkeletonLoader({ count = 5 }) {
  return (
    <section aria-label="Veriler yükleniyor" aria-busy="true" className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </section>
  );
}
