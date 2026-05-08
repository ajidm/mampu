export default function SkeletonDetail() {
  return (
    <div aria-busy="true" aria-label="Loading user details" className="space-y-6">
      <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-7 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-2 h-4 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
