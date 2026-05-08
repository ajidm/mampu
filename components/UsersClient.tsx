"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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

const PAGE_SIZE = 10;

interface Props {
  users: EnrichedUser[];
}

export default function UsersClient({ users }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const q             = searchParams.get("q") ?? "";
  const sort          = (searchParams.get("sort")      as SortKey)          ?? "name-asc";
  const filterPosts   = (searchParams.get("fp")        as PostsFilter)      ?? "all";
  const filterComp    = (searchParams.get("fc")        as CompletedFilter)  ?? "all";
  const filterPending = (searchParams.get("fpend")     as PendingFilter)    ?? "all";
  const page          = Number(searchParams.get("page") ?? "1");

  const hasActiveFilter =
    !!q.trim() ||
    filterPosts !== "all" ||
    filterComp !== "all" ||
    filterPending !== "all";

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v && v !== "all") params.set(k, v);
        else params.delete(k);
      });
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const backParams = searchParams.toString();

  const processed = useMemo(() => {
    let result = [...users];

    if (q.trim()) {
      const lower = q.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
      );
    }

    if (filterPosts === "has-posts")   result = result.filter((u) => u.totalPosts > 0);
    if (filterPosts === "no-posts")    result = result.filter((u) => u.totalPosts === 0);
    if (filterComp  === "has-completed") result = result.filter((u) => u.completedTodos > 0);
    if (filterComp  === "no-completed")  result = result.filter((u) => u.completedTodos === 0);
    if (filterPending === "has-pending") result = result.filter((u) => u.pendingTodos > 0);
    if (filterPending === "no-pending")  result = result.filter((u) => u.pendingTodos === 0);

    result.sort((a, b) => {
      if (sort === "name-asc")    return a.name.localeCompare(b.name);
      if (sort === "name-desc")   return b.name.localeCompare(a.name);
      if (sort === "pending-desc") return b.pendingTodos - a.pendingTodos;
      if (sort === "posts-desc")  return b.totalPosts - a.totalPosts;
      return 0;
    });

    return result;
  }, [users, q, sort, filterPosts, filterComp, filterPending]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = processed.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    let nextSort: SortKey = key;
    if (key === "name-asc" && sort === "name-asc")   nextSort = "name-desc";
    else if (key === "name-asc" && sort === "name-desc") nextSort = "name-asc";
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", nextSort);
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("q", value); else params.delete("q");
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.replace(pathname, { scroll: false });

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
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search users"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Specific filters */}
        <div className="flex flex-wrap gap-3">
          {/* Posts filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-posts"
              className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Posts
            </label>
            <select
              id="filter-posts"
              value={filterPosts}
              onChange={(e) => updateParams({ fp: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="has-posts">Has posts</option>
              <option value="no-posts">No posts</option>
            </select>
          </div>

          {/* Completed filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-completed"
              className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Completed
            </label>
            <select
              id="filter-completed"
              value={filterComp}
              onChange={(e) => updateParams({ fc: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="has-completed">Has completed</option>
              <option value="no-completed">No completed</option>
            </select>
          </div>

          {/* Pending filter */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="filter-pending"
              className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Pending
            </label>
            <select
              id="filter-pending"
              value={filterPending}
              onChange={(e) => updateParams({ fpend: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="has-pending">Has pending</option>
              <option value="no-pending">No pending</option>
            </select>
          </div>
        </div>
      </div>

      {slice.length === 0 ? (
        <EmptyState
          message={
            hasActiveFilter
              ? "No users match your current search or filter."
              : "No users found."
          }
          actionLabel={hasActiveFilter ? "Clear filters" : undefined}
          onAction={hasActiveFilter ? clearAll : undefined}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <UserTable
              rows={slice}
              backParams={backParams}
              sortKey={sort}
              onSort={handleSort}
            />
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {slice.map((user) => (
              <UserCard key={user.id} user={user} backParams={backParams} />
            ))}
          </div>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={handlePage}
          />
        </>
      )}
    </div>
  );
}
