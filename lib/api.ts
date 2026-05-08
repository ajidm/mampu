import type { EnrichedUser, Post, Todo, User } from "./types";

function getBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (!url) throw new Error("API_BASE_URL environment variable is not set");
  return url;
}

const REVALIDATE = 60;

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${getBaseUrl()}/users`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchUser(id: number): Promise<User | null> {
  const res = await fetch(`${getBaseUrl()}/users/${id}`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || !data.id) return null;
  return data;
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${getBaseUrl()}/posts`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${getBaseUrl()}/todos`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

export async function fetchUserPosts(userId: number): Promise<Post[]> {
  const res = await fetch(`${getBaseUrl()}/posts?userId=${userId}`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error("Failed to fetch user posts");
  return res.json();
}

export async function fetchUserTodos(userId: number): Promise<Todo[]> {
  const res = await fetch(`${getBaseUrl()}/todos?userId=${userId}`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error("Failed to fetch user todos");
  return res.json();
}

export function computeActivitySignals(
  users: User[],
  posts: Post[],
  todos: Todo[]
): EnrichedUser[] {
  return users.map((user) => {
    const userPosts = posts.filter((p) => p.userId === user.id);
    const userTodos = todos.filter((t) => t.userId === user.id);
    return {
      ...user,
      totalPosts: userPosts.length,
      completedTodos: userTodos.filter((t) => t.completed).length,
      pendingTodos: userTodos.filter((t) => !t.completed).length,
    };
  });
}
