export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: { lat: string; lng: string };
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  address: Address;
  company: Company;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface EnrichedUser extends User {
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
}

export type SortKey = "name-asc" | "name-desc" | "pending-desc" | "posts-desc";
export type PostsFilter     = "all" | "has-posts"      | "no-posts";
export type CompletedFilter = "all" | "has-completed"  | "no-completed";
export type PendingFilter   = "all" | "has-pending"    | "no-pending";
