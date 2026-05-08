# Detailed Use Cases (DUC)

**Project:** Mampu User Operations  
**Version:** 1.0  
**Date:** 2026-05-08  

---

## Overview

This document expands each user story from the PRD into a detailed use case with actors, preconditions, main flow, alternative flows, and postconditions.

---

## DUC-01 View Users List

| Field | Detail |
|---|---|
| **Use Case ID** | DUC-01 |
| **Name** | View Users List |
| **Related Stories** | US-01, US-06, US-08, US-09 |
| **Actor** | Visitor |
| **Preconditions** | Browser navigates to `/users`; network available |

### Main Flow
1. Browser sends GET `/users`.
2. Server Component fetches users, posts, and todos in parallel from JSONPlaceholder with ISR (revalidate 60 s).
3. Server computes `totalPosts`, `completedTodos`, `pendingTodos` per user.
4. Page streams HTML — skeleton table is shown while Suspense boundary resolves.
5. Resolved data replaces skeleton; table renders 10 rows (first page).
6. Visitor sees Name, Email, Website, Posts, Completed, Pending columns.

### Alternative Flows
| ID | Condition | Outcome |
|---|---|---|
| AF-01a | One or more fetches return non-2xx | Inline error alert displayed; partial data shown if possible |
| AF-01b | Network timeout | Error alert with "Unable to load users. Try again." |
| AF-01c | Empty users array | Empty-state message: "No users found." |

### Postconditions
- Users list rendered with activity signals.
- URL remains `/users` (no query params yet).

---

## DUC-02 Search Users

| Field | Detail |
|---|---|
| **Use Case ID** | DUC-02 |
| **Name** | Search Users by Name or Email |
| **Related Stories** | US-02, US-10 |
| **Actor** | Visitor |
| **Preconditions** | DUC-01 has completed successfully |

### Main Flow
1. Visitor types in the search input.
2. Client debounces input (300 ms) then filters the in-memory user list by name or email (case-insensitive substring match).
3. Matching rows are displayed; page resets to page 1.
4. Search query is written to URL param `?q=<value>`.

### Alternative Flows
| ID | Condition | Outcome |
|---|---|---|
| AF-02a | No users match the query | Empty-state message: "No users match '<query>'." with a "Clear search" button |
| AF-02b | Visitor clears the search input | Full list is restored; URL param `q` is removed |
| AF-02c | Visitor navigates to detail and presses Back | Search input is restored from URL param `q` |

### Postconditions
- Displayed list reflects the current search query.
- URL encodes query state for shareability.

---

## DUC-03 Sort Users

| Field | Detail |
|---|---|
| **Use Case ID** | DUC-03 |
| **Name** | Sort Users List |
| **Related Stories** | US-03, US-05 |
| **Actor** | Visitor |
| **Preconditions** | DUC-01 completed; users list visible |

### Main Flow
1. Visitor selects a sort option from the dropdown: Name A→Z | Name Z→A | Most Pending Todos | Most Posts.
2. Client sorts the filtered (post-search) user list in memory.
3. Table re-renders in sorted order; page resets to 1.
4. Sort value written to URL param `?sort=<value>`.

### Alternative Flows
| ID | Condition | Outcome |
|---|---|---|
| AF-03a | Selected sort is the same as current | No-op (UI stays the same) |
| AF-03b | Sorted list is empty due to active search | Empty-state is shown (same as AF-02a) |

### Postconditions
- List sorted per selected criterion.
- URL encodes sort state.

---

## DUC-04 Filter Users by Activity

| Field | Detail |
|---|---|
| **Use Case ID** | DUC-04 |
| **Name** | Filter Users by Activity Signals |
| **Related Stories** | US-04, US-10 |
| **Actor** | Visitor |
| **Preconditions** | DUC-01 completed; activity signals computed |

### Main Flow
1. Visitor selects a filter: All | Has Pending Todos | No Completed Todos.
2. Client applies the predicate to the current (post-search) user list.
3. Table re-renders; page resets to 1.
4. Filter value written to URL param `?filter=<value>`.

### Alternative Flows
| ID | Condition | Outcome |
|---|---|---|
| AF-04a | Filter produces no results | Empty-state message with "Clear filter" button |
| AF-04b | Visitor selects "All" | Filter predicate removed; full search result shown |

### Postconditions
- Displayed list satisfies the active filter predicate.
- URL encodes filter state.

---

## DUC-05 Paginate Users List

| Field | Detail |
|---|---|
| **Use Case ID** | DUC-05 |
| **Name** | Paginate Users List |
| **Related Stories** | US-07 |
| **Actor** | Visitor |
| **Preconditions** | Filtered/sorted list has more than 10 items |

### Main Flow
1. Visitor clicks "Next" or a page number button.
2. Client slices the current filtered+sorted list to the requested page (10 items/page).
3. Table updates; page number written to URL param `?page=<n>`.
4. Visitor clicks "Previous" to go back.

### Alternative Flows
| ID | Condition | Outcome |
|---|---|---|
| AF-05a | Search or filter changes while on page > 1 | Page resets to 1 automatically |
| AF-05b | Visitor is on last page | "Next" button is disabled |
| AF-05c | Visitor is on first page | "Previous" button is disabled |

### Postconditions
- Correct page of the filtered+sorted list is displayed.
- URL encodes page state.

---

## DUC-06 View User Detail

| Field | Detail |
|---|---|
| **Use Case ID** | DUC-06 |
| **Name** | View User Detail Page |
| **Related Stories** | US-11, US-12, US-13, US-16 |
| **Actor** | Visitor |
| **Preconditions** | Visitor clicks a user row/card on `/users`; user id is valid (1–10) |

### Main Flow
1. Browser navigates to `/users/[id]`.
2. Skeleton card is shown while Suspense boundary resolves.
3. Server Component fetches user, user's posts, and user's todos in parallel.
4. Detail card rendered with: Name, Username, Email, Phone, Website, Company, Address.
5. Posts section shows list of post titles (collapsed by default; click to expand body).
6. Todos section shows progress bar + individual todo items with completion icons.

### Alternative Flows
| ID | Condition | Outcome |
|---|---|---|
| AF-06a | User fetch returns 404 or empty | Styled "User not found" page with "Back to list" link |
| AF-06b | Posts or todos fetch fails | Card still renders; failed section shows inline error with retry |
| AF-06c | User id is non-numeric (e.g. `/users/abc`) | Redirect to "User not found" page |
| AF-06d | User has no posts | Posts section shows "No posts yet." |
| AF-06e | User has no todos | Todos section shows "No todos yet." |

### Postconditions
- User detail fully rendered with posts and todos.
- Page `<title>` is `"<Name> | Mampu Users"`.

---

## DUC-07 Navigate Back to List

| Field | Detail |
|---|---|
| **Use Case ID** | DUC-07 |
| **Name** | Return to Users List Preserving State |
| **Related Stories** | US-14 |
| **Actor** | Visitor |
| **Preconditions** | Visitor is on `/users/[id]` and previously had search/filter/sort/page state |

### Main Flow
1. Visitor clicks "← Back to list".
2. Link href includes the previously serialised query params (e.g. `?q=Bret&sort=name-asc&filter=pending&page=1`).
3. `/users` renders with those query params restored from the URL.
4. Search input, sort dropdown, and filter dropdown reflect previous state.

### Alternative Flows
| ID | Condition | Outcome |
|---|---|---|
| AF-07a | Visitor presses the browser's Back button | Same effect — URL params preserved in history |
| AF-07b | Visitor arrived at `/users/[id]` directly (no prior list state) | "← Back to list" links to `/users` with no params |

### Postconditions
- `/users` is displayed with all prior filter/search/sort state intact.

---

## DUC-08 Handle Invalid User ID

| Field | Detail |
|---|---|
| **Use Case ID** | DUC-08 |
| **Name** | Display Error for Invalid User ID |
| **Related Stories** | US-15 |
| **Actor** | Visitor |
| **Preconditions** | Visitor navigates to `/users/[id]` where id is invalid |

### Main Flow
1. Server Component attempts to fetch user for the given id.
2. JSONPlaceholder returns an empty object `{}` or 404.
3. Page renders a styled "User not found" error state.
4. Page includes a "← Back to list" link.
5. Page title is `"User Not Found | Mampu Users"`.

### Alternative Flows
| ID | Condition | Outcome |
|---|---|---|
| AF-08a | id is a string like `"abc"` | `notFound()` is called immediately without fetching |
| AF-08b | id is `0` or negative | `notFound()` called immediately |

### Postconditions
- Visitor sees a clear error message and a route back to the list.
- HTTP status is 404.
