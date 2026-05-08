"use client";

import { useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { EnrichedUser, FilterKey, SortKey } from "@/lib/types";
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

  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as SortKey) ?? "name-asc";
  const filter = (searchParams.get("filter") as FilterKey) ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
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

    if (filter === "has-pending") {
      result = result.filter((u) => u.pendingTodos > 0);
    } else if (filter === "no-completed") {
      result = result.filter((u) => u.completedTodos === 0);
    }

    result.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "pending-desc") return b.pendingTodos - a.pendingTodos;
      if (sort === "posts-desc") return b.totalPosts - a.totalPosts;
      return 0;
    });

    return result;
  }, [users, q, sort, filter]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = processed.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    let nextSort: SortKey = key;
    if (key === "name-asc" && sort === "name-asc") nextSort = "name-desc";
    else if (key === "name-asc" && sort === "name-desc") nextSort = "name-asc";
    updateParams({ sort: nextSort, page: "1" });
  };

  const handleSearch = (value: string) => {
    updateParams({ q: value, page: "1" });
  };

  const handleFilter = (value: FilterKey) => {
    updateParams({ filter: value === "all" ? "" : value, page: "1" });
  };

  const handlePage = (next: number) => {
    updateParams({ page: String(next) });
  };

  const clearAll = () => {
    router.replace(pathname, { scroll: false });
  };

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search with clickable icon */}
        <div className="relative w-full sm:max-w-xs">
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

        {/* Filter with label */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="filter-select"
            className="shrink-0 text-sm font-medium text-gray-600"
          >
            Filter
          </label>
          <select
            id="filter-select"
            value={filter}
            onChange={(e) => handleFilter(e.target.value as FilterKey)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All users</option>
            <option value="has-pending">Has pending todos</option>
            <option value="no-completed">No completed todos</option>
          </select>
        </div>
      </div>

      {slice.length === 0 ? (
        <EmptyState
          message={
            q || filter !== "all"
              ? `No users match your current search or filter.`
              : "No users found."
          }
          actionLabel={q || filter !== "all" ? "Clear filters" : undefined}
          onAction={q || filter !== "all" ? clearAll : undefined}
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
