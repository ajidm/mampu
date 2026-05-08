# Mampu User Operations – Technical Assignment

A Next.js + TypeScript web application built as part of the PT Mampu Inovasi Digital technical assessment. The app displays users fetched from JSONPlaceholder, enriched with their posts and todos activity, with full navigation between list and detail views.

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data Fetching | Server Components (async fetch) |
| Unit Testing | Jest 30 + React Testing Library 16 + user-event 14 |
| E2E Testing | Playwright 1.59 (Chromium) |
| Linting | ESLint 9 |

## Features

- `/users` — Paginated, searchable, sortable users list enriched with post count and todo stats
- `/users/[id]` — User detail card with contact, company, address, posts, and todos sections
- Client-side search by name or email
- Multi-criteria filter: posts, completed todos, pending todos
- Sort by name (asc/desc) or by pending/posts count
- Filter & sort state persisted to `sessionStorage` — restored on back-navigation, reset on hard refresh
- Active filter badges with per-filter dismiss and "Clear all"
- Skeleton loading states, empty-state messaging, and error boundaries on both routes
- Responsive layout: table on desktop, card stack on mobile
- ISR cache revalidation (60 s) on all fetched data
- SEO metadata via `generateMetadata` on detail pages
- `notFound()` for invalid or non-existent user IDs

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 9

### Installation

```bash
git clone <repo-url>
cd mampu
npm install
```

Copy the environment file:

```bash
# .env.local
API_BASE_URL=https://jsonplaceholder.typicode.com
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Start

```bash
npm run build
npm start
```

## Testing

### Unit tests (Jest + RTL)

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**63 tests, 3 suites** — covers components (`PostsList`, `TodosList`, `EmptyState`, `ErrorAlert`, `SkeletonTable`, `SkeletonDetail`), client logic (`UsersClient` — search, filter, sort, pagination, sessionStorage), error pages (`UsersError`, `UserDetailError`), and the `UserDetailPage` server component (valid/invalid/missing user, API mocking).

### E2E tests (Playwright)

```bash
# Run E2E tests (requires dev server running on port 3000)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

**16 tests** across 3 suites:

| Suite | Tests |
|---|---|
| Users list page | heading, rows, search, empty state, clear filters, dropdowns, sort, pagination |
| User detail page | profile fields, Posts/Todos sections, back-to-list, not-found (invalid & non-numeric id) |
| Filter state persistence | reset on hard refresh, preserved on back-navigation |

Results saved to `.docs/e2e-results.md`.

## Project Structure

```
mampu/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home → redirects to /users
│   ├── not-found.tsx           # Global 404 page
│   └── users/
│       ├── page.tsx            # Users list (Server Component)
│       ├── error.tsx           # Error boundary
│       └── [id]/
│           ├── page.tsx        # User detail (Server Component)
│           └── error.tsx       # Error boundary
├── components/
│   ├── UsersClient.tsx         # Client Component (search/filter/sort/pagination)
│   ├── UserTable.tsx
│   ├── UserCard.tsx
│   ├── SkeletonTable.tsx
│   ├── SkeletonDetail.tsx
│   ├── PostsList.tsx
│   ├── TodosList.tsx
│   ├── EmptyState.tsx
│   ├── ErrorAlert.tsx
│   └── Pagination.tsx
├── lib/
│   ├── api.ts                  # Fetch helpers + computeActivitySignals
│   └── types.ts                # Shared TypeScript interfaces
├── __tests__/
│   ├── users-list.test.tsx
│   ├── user-detail.test.tsx
│   └── user-detail-page.test.tsx
├── e2e/
│   └── happy-path.spec.ts      # Playwright E2E tests
├── playwright.config.ts
└── .docs/
    ├── PRD.md
    ├── DUC.md
    ├── CUC.md
    ├── test-results.md         # Unit test results
    └── e2e-results.md          # E2E test results
```

## API Endpoints Used

| Data | URL |
|---|---|
| All users | `GET /users` |
| Single user | `GET /users/{id}` |
| All posts | `GET /posts` |
| All todos | `GET /todos` |
| User posts | `GET /posts?userId={id}` |
| User todos | `GET /todos?userId={id}` |

Base URL: `https://jsonplaceholder.typicode.com`

## Bonus Features Implemented

- [x] ISR with `revalidate: 60`
- [x] `generateMetadata` for detail pages
- [x] Error boundaries on both routes
- [x] Pagination on `/users`
- [x] Playwright E2E tests (16 tests, all passing)

## License

Technical assessment submission — not for redistribution.  
Copyright © 2026 PT Mampu Inovasi Digital.
