import type { Post } from "@/lib/types";

interface Props {
  posts: Post[];
}

export default function PostsList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <section aria-label="Posts">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          Posts <span className="text-gray-400">(0)</span>
        </h2>
        <p className="text-sm text-gray-500">No posts yet.</p>
      </section>
    );
  }

  return (
    <section aria-label="Posts">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        Posts <span className="text-gray-400">({posts.length})</span>
      </h2>
      <div className="space-y-2">
        {posts.map((post) => (
          <details
            key={post.id}
            className="group rounded-lg border border-gray-200 bg-white"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-2 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg">
              <span className="capitalize">{post.title}</span>
              <span
                className="ml-2 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                aria-hidden="true"
              >
                ▾
              </span>
            </summary>
            <p className="px-4 pb-4 pt-1 text-sm leading-relaxed text-gray-600">
              {post.body}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
