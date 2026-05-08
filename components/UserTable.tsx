import Link from "next/link";
import type { EnrichedUser, SortKey } from "@/lib/types";

interface Props {
  rows: EnrichedUser[];
  backParams: string;
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
}

const columns: { label: string; key: SortKey | null }[] = [
  { label: "Name", key: "name-asc" },
  { label: "Email", key: null },
  { label: "Website", key: null },
  { label: "Posts", key: "posts-desc" },
  { label: "Completed", key: null },
  { label: "Pending", key: "pending-desc" },
];

function ariaSortValue(
  col: SortKey | null,
  active: SortKey
): "ascending" | "descending" | "none" {
  if (!col) return "none";
  if (col === active) return col.endsWith("asc") ? "ascending" : "descending";
  if (col === "name-asc" && active === "name-desc") return "descending";
  return "none";
}

export default function UserTable({ rows, backParams, sortKey, onSort }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm" role="grid">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(({ label, key }) => (
              <th
                key={label}
                scope="col"
                aria-sort={ariaSortValue(key, sortKey)}
                className="px-4 py-3 text-left font-semibold text-gray-600"
              >
                {key ? (
                  <button
                    onClick={() => onSort(key)}
                    className="flex items-center gap-1 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                  >
                    {label}
                    <span className="text-gray-400" aria-hidden="true">
                      {sortKey === key || (key === "name-asc" && sortKey === "name-desc")
                        ? sortKey.endsWith("asc")
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </button>
                ) : (
                  label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((user) => (
            <tr
              key={user.id}
              className="transition-colors hover:bg-blue-50 focus-within:bg-blue-50"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                <Link
                  href={`/users/${user.id}?${backParams}`}
                  className="block truncate max-w-[200px] text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                  aria-label={`View details for ${user.name}`}
                >
                  {user.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
                {user.email}
              </td>
              <td className="px-4 py-3 text-gray-600 truncate max-w-[160px]">
                {user.website}
              </td>
              <td className="px-4 py-3 text-center text-gray-700">
                {user.totalPosts}
              </td>
              <td className="px-4 py-3 text-center text-green-700">
                {user.completedTodos}
              </td>
              <td className="px-4 py-3 text-center text-amber-700">
                {user.pendingTodos}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
