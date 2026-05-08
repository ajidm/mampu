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
// Set on the window object after the first mount; absent in a fresh JS context (hard refresh).
// Survives client-side unmount/remount (back-navigation) within the same tab session.
const MOUNT_FLAG = "__mampu_users_mounted__";

// Called once per component mount via useState lazy initializers (runs before any effects).
// Returns saved state only when coming back via client-side navigation; returns {} otherwise.
function getInitialState(): Partial<PersistedState> {
  if (typeof window === "undefined") return {};
  const w = window as Record<string, unknown>;
  return w[MOUNT_FLAG] === true ? loadState() : {};
}

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

function Badge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-700 focus:outline-none"
      >
        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8" aria-hidden="true">
          <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
        </svg>
      </button>
    </span>
  );
}

export default function UsersClient({ users }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // State is initialised from sessionStorage on back-navigation (MOUNT_FLAG already set),
  // or from defaults on a fresh load / hard refresh (MOUNT_FLAG absent).
  // Using lazy initialisers means the save effect captures the correct values from render 1,
  // which avoids a Strict Mode race where the save effect would overwrite sessionStorage with
  // defaults before the restore effect could read the real saved values.
  const [_init] = useState<Partial<PersistedState>>(getInitialState);
  const [q,             setQ]             = useState(_init.q             ?? "");
  const [sort,          setSort]          = useState<SortKey>(_init.sort  ?? "name-asc");
  const [filterPosts,   setFilterPosts]   = useState<PostsFilter>(_init.filterPosts  ?? "all");
  const [filterComp,    setFilterComp]    = useState<CompletedFilter>(_init.filterComp ?? "all");
  const [filterPending, setFilterPending] = useState<PendingFilter>(_init.filterPending ?? "all");
  const [page,          setPage]          = useState(_init.page           ?? 1);
  const [pageSize,      setPageSize]      = useState(_init.pageSize       ?? DEFAULT_PAGE_SIZE);

  // On mount: mark the JS context as "active" so back-navigations can restore state.
  // On first-ever mount (MOUNT_FLAG absent = hard refresh), also clear any stale sessionStorage.
  useEffect(() => {
    const w = window as Record<string, unknown>;
    if (w[MOUNT_FLAG] !== true) sessionStorage.removeItem(STORAGE_KEY);
    w[MOUNT_FLAG] = true;
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

  const selectCls =
    "rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors";
  const labelCls = "shrink-0 text-xs font-medium text-gray-400";

  return (
    <div className="space-y-4">
      {/* Controls — one cohesive bar */}
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">

          {/* Search input — icon on the right */}
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <input
              ref={inputRef}
              type="search"
              placeholder="Search by name or email…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              aria-label="Search users"
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-9 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <button
              type="button"
              aria-label="Submit search"
              onClick={() => inputRef.current?.focus()}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-500 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </div>

          {/* Vertical divider */}
          <div className="hidden h-5 w-px bg-gray-200 sm:block" aria-hidden="true" />

          {/* Filter label */}
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-300">Filter</span>

          {/* Posts */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-posts" className={labelCls}>Posts</label>
            <select id="filter-posts" value={filterPosts}
              onChange={(e) => { setFilterPosts(e.target.value as PostsFilter); setPage(1); }}
              className={selectCls}>
              <option value="all">All</option>
              <option value="has-posts">Has posts</option>
              <option value="no-posts">No posts</option>
            </select>
          </div>

          {/* Completed */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-completed" className={labelCls}>Completed</label>
            <select id="filter-completed" value={filterComp}
              onChange={(e) => { setFilterComp(e.target.value as CompletedFilter); setPage(1); }}
              className={selectCls}>
              <option value="all">All</option>
              <option value="has-completed">Has completed</option>
              <option value="no-completed">No completed</option>
            </select>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-pending" className={labelCls}>Pending</label>
            <select id="filter-pending" value={filterPending}
              onChange={(e) => { setFilterPending(e.target.value as PendingFilter); setPage(1); }}
              className={selectCls}>
              <option value="all">All</option>
              <option value="has-pending">Has pending</option>
              <option value="no-pending">No pending</option>
            </select>
          </div>

          {/* Vertical divider */}
          <div className="hidden h-5 w-px bg-gray-200 sm:block" aria-hidden="true" />

          {/* Show per page */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="page-size" className={labelCls}>Show</label>
            <select id="page-size" value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className={selectCls}>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter badges */}
        {hasActiveFilter && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2.5">
            <span className="text-xs text-gray-400">Active:</span>
            {q && (
              <Badge label={`Search: "${q}"`} onRemove={() => { setQ(""); setPage(1); }} />
            )}
            {filterPosts !== "all" && (
              <Badge label={`Posts: ${filterPosts}`} onRemove={() => { setFilterPosts("all"); setPage(1); }} />
            )}
            {filterComp !== "all" && (
              <Badge label={`Completed: ${filterComp}`} onRemove={() => { setFilterComp("all"); setPage(1); }} />
            )}
            {filterPending !== "all" && (
              <Badge label={`Pending: ${filterPending}`} onRemove={() => { setFilterPending("all"); setPage(1); }} />
            )}
            <button
              onClick={clearAll}
              className="ml-1 text-xs text-blue-500 hover:text-blue-700 hover:underline focus:outline-none"
            >
              Clear all
            </button>
          </div>
        )}
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
