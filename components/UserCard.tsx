import Link from "next/link";
import type { EnrichedUser } from "@/lib/types";

interface Props {
  user: EnrichedUser;
}

export default function UserCard({ user }: Props) {
  return (
    <Link
      href={`/users/${user.id}`}
      aria-label={`View details for ${user.name}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{user.name}</p>
          <p className="truncate text-sm text-gray-500">{user.email}</p>
          <p className="truncate text-sm text-blue-600">{user.website}</p>
        </div>
        <div className="shrink-0 text-right text-xs text-gray-500">
          <p>
            <span className="font-medium text-gray-700">{user.totalPosts}</span> posts
          </p>
          <p>
            <span className="font-medium text-green-600">{user.completedTodos}</span> done
          </p>
          <p>
            <span className="font-medium text-amber-600">{user.pendingTodos}</span> pending
          </p>
        </div>
      </div>
    </Link>
  );
}
