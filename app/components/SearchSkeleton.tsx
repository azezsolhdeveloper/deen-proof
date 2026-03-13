// app/components/SearchSkeleton.tsx
'use client';

export default function SearchSkeleton() {
  return (
    <div className="p-4">
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-full"></div>
            <div className="h-3 bg-slate-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
