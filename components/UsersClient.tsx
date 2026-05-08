"use client";

import { useEffect, useRef, useState } from "react";
import type {
  EnrichedUser,
  SortKey,
  PostsFilter,
  CompletedFilter,
  PendingFilter,
} from "@/lib/types";
import UserTable from "./UserTable";
import UserCard from "./UserCard";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = 10;
const STORAGE_KEY = "mampu:users-state";

interface PersistedState {
  q: string;
  sort: SortKey;
  filterPosts: PostsFilter;
  filterComp: CompletedFilter;
  filterPending: PendingFilter;
  page: number;
  pageSize: number;
}

function loadState(): Partial<PersistedState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : {};
  } catch {
    return {};
  }
}

function saveState(state: PersistedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

interface Props {
  users: EnrichedUser[];
}

export default function UsersClient({ users }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [q,             setQ]             = useState("");
  const [sort,          setSort]          = useState<SortKey>("name-asc");
  const [filterPosts,   setFilterPosts]   = useState<PostsFilter>("all");
  const [filterComp,    setFilterComp]    = useState<CompletedFilter>("all");
  const [filterPending, setFilterPending] = useState<PendingFilter>("all");
  const [page,          setPage]          = useState(1);
  const [pageSize,      setPageSize]      = useState(DEFAULT_PAGE_SIZE);

  // Restore state from sessionStorage after hydration
  useEffect(() => {
    const s = loadState();
    if (s.q             !== undefined) setQ(s.q);
    if (s.sort          !== undefined) setSort(s.sort);
    if (s.filterPosts   !== undefined) setFilterPosts(s.filterPosts);
    if (s.filterComp    !== undefined) setFilterComp(s.filterComp);
    if (s.filterPending !== undefined) setFilterPending(s.filterPending);
    if (s.page          !== undefined) setPage(s.page);
    if (s.pageSize      !== undefined) setPageSize(s.pageSize);
  }, []);

  // Persist state to sessionStorage on every change
  useEffect(() => {
    saveState({ q, sort, filterPosts, filterComp, filterPending, page, pageSize });
  }, [q, sort, filterPosts, filterComp, filterPending, page, pageSize]);

  const hasActiveFilter =
    !!q.trim() ||
    filterPosts !== "all" ||
    filterComp  !== "all" ||
    filterPending !== "all";

  // Derived list
  let processed = [...users];

  if (q.trim()) {
    const lower = q.trim().toLowerCase();
    processed = processed.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
    );
  }
  if (filterPosts   === "has-posts")      processed = processed.filter((u) => u.totalPosts > 0);
  if (filterPosts   === "no-posts")       processed = processed.filter((u) => u.totalPosts === 0);
  if (filterComp    === "has-completed")  processed = processed.filter((u) => u.completedTodos > 0);
  if (filterComp    === "no-completed")   processed = processed.filter((u) => u.completedTodos === 0);
  if (filterPending === "has-pending")    processed = processed.filter((u) => u.pendingTodos > 0);
  if (filterPending === "no-pending")     processed = processed.filter((u) => u.pendingTodos === 0);

  processed.sort((a, b) => {
    if (sort === "name-asc")     return a.name.localeCompare(b.name);
    if (sort === "name-desc")    return b.name.localeCompare(a.name);
    if (sort === "pending-desc") return b.pendingTodos - a.pendingTodos;
    if (sort === "posts-desc")   return b.totalPosts - a.totalPosts;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const slice      = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: SortKey) => {
    setSort((prev) => {
      if (key === "name-asc" && prev === "name-asc") return "name-desc";
      if (key === "name-asc" && prev === "name-desc") return "name-asc";
      return key;
    });
    setPage(1);
  };

  const clearAll = () => {
    setQ("");
    setFilterPosts("all");
    setFilterComp("all");
    setFilterPending("all");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs">
          <button
            type="button"
            aria-label="Submit search"
            onClick={() => inputRef.current?.focus()}
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-blue-500 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="search"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            aria-label="Search users"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filters + display */}
        <div className="flex flex-wrap gap-3">
          {/* Posts */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-posts" className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Posts
            </label>
            <select
              id="filter-posts"
              value={filterPosts}
              onChange={(e) => { setFilterPosts(e.target.value as PostsFilter); setPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="has-posts">Has posts</option>
              <option value="no-posts">No posts</option>
            </select>
          </div>

          {/* Completed */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-completed" className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Completed
            </label>
            <select
              id="filter-completed"
              value={filterComp}
              onChange={(e) => { setFilterComp(e.target.value as CompletedFilter); setPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="has-completed">Has completed</option>
              <option value="no-completed">No completed</option>
            </select>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-pending" className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Pending
            </label>
            <select
              id="filter-pending"
              value={filterPending}
              onChange={(e) => { setFilterPending(e.target.value as PendingFilter); setPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="has-pending">Has pending</option>
              <option value="no-pending">No pending</option>
            </select>
          </div>

          {/* Display per page */}
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Show
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {slice.length === 0 ? (
        <EmptyState
          message={hasActiveFilter ? "No users match your current search or filter." : "No users found."}
          actionLabel={hasActiveFilter ? "Clear filters" : undefined}
          onAction={hasActiveFilter ? clearAll : undefined}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <UserTable rows={slice} sortKey={sort} onSort={handleSort} />
          </div>

          <div className="grid gap-3 md:hidden">
            {slice.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={processed.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
