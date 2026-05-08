import { Suspense } from "react";
import { fetchUsers, fetchPosts, fetchTodos, computeActivitySignals } from "@/lib/api";
import UsersClient from "@/components/UsersClient";
import SkeletonTable from "@/components/SkeletonTable";

export const metadata = {
  title: "Users",
  description: "Browse all users with their activity signals",
};

async function UsersList() {
  const [users, posts, todos] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchTodos(),
  ]);
  const enriched = computeActivitySignals(users, posts, todos);
  return <UsersClient users={enriched} />;
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse users and their activity across posts and todos.
        </p>
      </div>
      <Suspense fallback={<SkeletonTable />}>
        <UsersList />
      </Suspense>
    </div>
  );
}
