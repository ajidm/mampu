# Component Use Cases (CUC)

**Project:** Mampu User Operations  
**Version:** 1.0  
**Date:** 2026-05-08  

---

## Overview

This document defines the component-level use cases: what each component renders, what props it accepts, what interactions it handles, and what tests must cover it. It bridges the DUC (business flows) and the actual implementation.

---

## CUC-01 `UsersClient` (Client Component)

**File:** `app/users/UsersClient.tsx`  
**Role:** Owns client-side state (search, sort, filter, page) and renders the list.

### Props

| Prop | Type | Description |
|---|---|---|
| `users` | `EnrichedUser[]` | Pre-computed list from server (includes activity signals) |

### State (via URL search params)

| Param | Default | Description |
|---|---|---|
| `q` | `""` | Search query (name or email) |
| `sort` | `"name-asc"` | Sort key: `name-asc` \| `name-desc` \| `pending-desc` \| `posts-desc` |
| `filter` | `"all"` | Filter key: `all` \| `has-pending` \| `no-completed` |
| `page` | `1` | Current page number |

### Interactions Handled

1. Typing in search input → debounce 300 ms → update `q` param → reset `page` to 1
2. Selecting sort option → update `sort` param → reset `page` to 1
3. Selecting filter option → update `filter` param → reset `page` to 1
4. Clicking Next/Prev page → update `page` param
5. Clicking a user row → navigate to `/users/[id]?back=<encoded-params>`

### Rendering Logic

```
users
  → filtered by `q` (name | email)
  → filtered by `filter` predicate
  → sorted by `sort` criterion
  → sliced to current `page` (10/page)
  → if empty → <EmptyState />
  → if not empty → <UserTable rows={slice} /> (desktop) + <UserCardList items={slice} /> (mobile)
```

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-01-T01 | Renders all users when no filters active |
| CUC-01-T02 | Filters list by name (partial, case-insensitive) |
| CUC-01-T03 | Filters list by email |
| CUC-01-T04 | Shows empty state when no match |
| CUC-01-T05 | Sorts by name A→Z |
| CUC-01-T06 | Sorts by most pending todos |
| CUC-01-T07 | Applies "has pending" filter |
| CUC-01-T08 | Resets page to 1 when search changes |
| CUC-01-T09 | Shows correct page of results |

---

## CUC-02 `UserTable` (Presentational Component)

**File:** `components/UserTable.tsx`  
**Role:** Renders a semantic HTML table for desktop viewports.

### Props

| Prop | Type | Description |
|---|---|---|
| `rows` | `EnrichedUser[]` | Slice of users to display |
| `backParams` | `string` | Encoded query string to append to detail link |

### Accessibility Requirements

- `<table>` with `role="grid"` or implicit table role
- `<th scope="col">` for each column header
- Each row is a `<tr>` wrapping a `<Link>` with visible focus ring
- Sortable columns expose `aria-sort` attribute

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-02-T01 | Renders correct number of rows |
| CUC-02-T02 | Each row links to `/users/[id]` |
| CUC-02-T03 | Displays Name, Email, Website, Posts, Completed, Pending values |
| CUC-02-T04 | Column headers have correct `scope` attribute |

---

## CUC-03 `UserCard` (Presentational Component)

**File:** `components/UserCard.tsx`  
**Role:** Mobile-friendly card for a single user in the list.

### Props

| Prop | Type | Description |
|---|---|---|
| `user` | `EnrichedUser` | Single user with activity signals |
| `backParams` | `string` | Encoded query string to append to detail link |

### Layout

```
┌─────────────────────────────┐
│  Name (bold)        Posts: N │
│  Email              ✓ N  ⏳ N│
│  Website                    │
└─────────────────────────────┘
```

Entire card is wrapped in a `<Link>` with `aria-label="View details for <Name>"`.

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-03-T01 | Renders user name, email, website |
| CUC-03-T02 | Renders activity signals (posts, completed, pending) |
| CUC-03-T03 | Card links to correct `/users/[id]` route |

---

## CUC-04 `SkeletonTable` (Loading Component)

**File:** `components/SkeletonTable.tsx`  
**Role:** Placeholder shown during Suspense while data fetches.

### Behaviour

- Renders a table shell with 10 rows of animated grey bars.
- Used in `app/users/loading.tsx`.
- `aria-busy="true"` on wrapper; `aria-hidden="true"` on placeholder cells.

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-04-T01 | Renders exactly 10 skeleton rows |
| CUC-04-T02 | Has `aria-busy` attribute |

---

## CUC-05 `UserDetailCard` (Presentational Component)

**File:** `components/UserDetailCard.tsx`  
**Role:** Renders the user's full profile card on `/users/[id]`.

### Props

| Prop | Type | Description |
|---|---|---|
| `user` | `User` | Full user object from API |

### Sections

1. **Header** – Name + Username badge
2. **Contact** – Email, Phone, Website (as anchor)
3. **Company** – Name + catchphrase in italic
4. **Address** – Street, Suite, City, Zipcode formatted on two lines

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-05-T01 | Renders all contact fields |
| CUC-05-T02 | Renders company name and catchphrase |
| CUC-05-T03 | Renders formatted address |
| CUC-05-T04 | Website renders as `<a>` with correct href |

---

## CUC-06 `PostsList` (Component)

**File:** `components/PostsList.tsx`  
**Role:** Collapsible list of the user's posts on the detail page.

### Props

| Prop | Type | Description |
|---|---|---|
| `posts` | `Post[]` | Array of posts belonging to the user |

### Behaviour

- Renders a section heading "Posts (N)".
- Each post shows title; clicking expands to reveal body text.
- Collapse/expand handled by `<details>`/`<summary>` for native keyboard support.
- If `posts.length === 0`, renders "No posts yet."

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-06-T01 | Renders correct post count in heading |
| CUC-06-T02 | Clicking a post title reveals the body |
| CUC-06-T03 | Shows empty state when posts array is empty |

---

## CUC-07 `TodosList` (Component)

**File:** `components/TodosList.tsx`  
**Role:** Progress bar + itemised todos on the detail page.

### Props

| Prop | Type | Description |
|---|---|---|
| `todos` | `Todo[]` | Array of todos belonging to the user |

### Behaviour

- Renders a progress bar: `completedCount / totalCount`.
- Renders each todo with a checkmark (✓ green) or pending (○ grey) icon.
- Completed todos are visually strikethrough.
- If `todos.length === 0`, renders "No todos yet."
- `<progress>` element used for the bar with `aria-label="Todo completion"`.

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-07-T01 | Progress bar value matches completion ratio |
| CUC-07-T02 | Completed todos have strikethrough style |
| CUC-07-T03 | Pending todos have pending icon |
| CUC-07-T04 | Shows empty state when todos array is empty |

---

## CUC-08 `EmptyState` (Presentational Component)

**File:** `components/EmptyState.tsx`  
**Role:** Shown when a filter/search produces no results.

### Props

| Prop | Type | Description |
|---|---|---|
| `message` | `string` | Primary message to display |
| `actionLabel` | `string` (optional) | Label for the reset action button |
| `onAction` | `() => void` (optional) | Callback when action button is clicked |

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-08-T01 | Renders the given message |
| CUC-08-T02 | Renders action button when `actionLabel` and `onAction` provided |
| CUC-08-T03 | Calls `onAction` when button clicked |

---

## CUC-09 `ErrorAlert` (Presentational Component)

**File:** `components/ErrorAlert.tsx`  
**Role:** Inline error banner shown when an API call fails.

### Props

| Prop | Type | Description |
|---|---|---|
| `message` | `string` | Human-readable error message |
| `onRetry` | `() => void` (optional) | Retry callback |

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-09-T01 | Renders error message |
| CUC-09-T02 | Renders retry button when `onRetry` provided |
| CUC-09-T03 | Calls `onRetry` when retry button clicked |

---

## CUC-10 `lib/api.ts` (Data Layer)

**File:** `lib/api.ts`  
**Role:** Centralises all fetch calls with ISR config.

### Functions

| Function | Endpoint | Cache |
|---|---|---|
| `fetchUsers()` | `/users` | `revalidate: 60` |
| `fetchUser(id)` | `/users/{id}` | `revalidate: 60` |
| `fetchPosts()` | `/posts` | `revalidate: 60` |
| `fetchTodos()` | `/todos` | `revalidate: 60` |
| `fetchUserPosts(userId)` | `/posts?userId={id}` | `revalidate: 60` |
| `fetchUserTodos(userId)` | `/todos?userId={id}` | `revalidate: 60` |
| `computeActivitySignals(users, posts, todos)` | — | Pure function |

### `computeActivitySignals` Contract

```ts
type EnrichedUser = User & {
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
};

function computeActivitySignals(
  users: User[],
  posts: Post[],
  todos: Todo[]
): EnrichedUser[]
```

### Tests Required

| Test ID | Scenario |
|---|---|
| CUC-10-T01 | `computeActivitySignals` returns correct totalPosts per user |
| CUC-10-T02 | Returns correct completedTodos count |
| CUC-10-T03 | Returns correct pendingTodos count |
| CUC-10-T04 | Handles user with zero posts and todos |

---

## CUC-11 `lib/types.ts` (Shared Types)

**File:** `lib/types.ts`  
**Role:** Single source of truth for TypeScript interfaces.

### Interfaces

```ts
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string; catchPhrase: string; bs: string };
  address: { street: string; suite: string; city: string; zipcode: string; geo: { lat: string; lng: string } };
}

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

interface EnrichedUser extends User {
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
}
```
