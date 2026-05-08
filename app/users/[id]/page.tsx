import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchUser, fetchUserPosts, fetchUserTodos } from "@/lib/api";
import PostsList from "@/components/PostsList";
import TodosList from "@/components/TodosList";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return { title: "User Not Found" };
  }
  const user = await fetchUser(userId);
  if (!user) return { title: "User Not Found" };
  return {
    title: user.name,
    description: user.company.catchPhrase,
  };
}

export default async function UserDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const backQuery = await searchParams;

  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  const [user, posts, todos] = await Promise.all([
    fetchUser(userId),
    fetchUserPosts(userId),
    fetchUserTodos(userId),
  ]);

  if (!user) notFound();

  const backHref =
    Object.keys(backQuery).length > 0
      ? `/users?${new URLSearchParams(backQuery).toString()}`
      : "/users";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
      >
        ← Back to list
      </Link>

      {/* Profile card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-start gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              @{user.username}
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Contact */}
          <section aria-label="Contact information">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Contact
            </h2>
            <dl className="space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-gray-400">Email</dt>
                <dd className="truncate text-gray-700">{user.email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-gray-400">Phone</dt>
                <dd className="text-gray-700">{user.phone}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-gray-400">Website</dt>
                <dd className="truncate">
                  <a
                    href={`https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {user.website}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          {/* Company */}
          <section aria-label="Company information">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Company
            </h2>
            <p className="text-sm font-medium text-gray-800">{user.company.name}</p>
            <p className="mt-0.5 text-sm italic text-gray-500">
              &ldquo;{user.company.catchPhrase}&rdquo;
            </p>
          </section>

          {/* Address */}
          <section aria-label="Address">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Address
            </h2>
            <address className="not-italic text-sm text-gray-700">
              <p>
                {user.address.street}, {user.address.suite}
              </p>
              <p>
                {user.address.city}, {user.address.zipcode}
              </p>
            </address>
          </section>
        </div>
      </div>

      {/* Posts section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <PostsList posts={posts} />
      </div>

      {/* Todos section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <TodosList todos={todos} />
      </div>
    </div>
  );
}
