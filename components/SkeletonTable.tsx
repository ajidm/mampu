export default function SkeletonTable() {
  return (
    <div aria-busy="true" aria-label="Loading users">
      {/* Desktop skeleton */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Name", "Email", "Website", "Posts", "Completed", "Pending"].map(
                (h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-3 text-left font-medium text-gray-500"
                    aria-hidden="true"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-3" aria-hidden="true">
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile skeleton */}
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-4"
            aria-hidden="true"
          >
            <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="mb-1 h-3 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
