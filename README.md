# Mampu User Operations – Technical Assignment

A Next.js + TypeScript web application built as part of the PT Mampu Inovasi Digital technical assessment. The app displays users fetched from JSONPlaceholder, enriched with their posts and todos activity, with full CRUD-style navigation between list and detail views.

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Data Fetching | Server Components (async fetch) + SWR for client state |
| Testing | Jest + React Testing Library |
| Linting | ESLint + Prettier |

## Features

- `/users` – Paginated, searchable, sortable users list enriched with post count and todo stats
- `/users/[id]` – User detail card with company, address, posts, and todos sections
- Client-side search (name / email) and multi-criteria sort
- Filter by activity signals (e.g. users with pending todos)
- Preserved filter/search state on back-navigation via URL search params
- Skeleton loading states, empty-state messaging, and error boundaries
- Responsive layout: table on desktop, card stack on mobile
- ISR cache revalidation (60 s) on user data
- SEO metadata via `generateMetadata`

## Getting Started

### Prerequisites

- Node.js ≥ 20 (required by Next.js 16)
- npm ≥ 9 (or pnpm / yarn)

### Installation

```bash
git clone <repo-url>
cd mampu
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Project Structure

```
mampu/
├── app/
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home → redirects to /users
│   ├── users/
│   │   ├── page.tsx          # Users list (Server Component)
│   │   ├── loading.tsx       # Skeleton fallback
│   │   ├── error.tsx         # Error boundary
│   │   ├── UsersClient.tsx   # Client Component (search/filter/sort)
│   │   └── [id]/
│   │       ├── page.tsx      # User detail (Server Component)
│   │       ├── loading.tsx
│   │       └── error.tsx
├── components/
│   ├── UserTable.tsx
│   ├── UserCard.tsx
│   ├── SkeletonTable.tsx
│   ├── PostsList.tsx
│   └── TodosList.tsx
├── lib/
│   ├── api.ts                # Fetch helpers with ISR config
│   └── types.ts              # Shared TypeScript interfaces
├── __tests__/
│   ├── users-list.test.tsx
│   └── user-detail.test.tsx
└── .docs/
    ├── PRD.md
    ├── DUC.md
    └── CUC.md
```

## API Endpoints Used

| Data | URL |
|---|---|
| Users | `https://jsonplaceholder.typicode.com/users` |
| Single User | `https://jsonplaceholder.typicode.com/users/{id}` |
| Posts | `https://jsonplaceholder.typicode.com/posts` |
| Todos | `https://jsonplaceholder.typicode.com/todos` |

## Bonus Features Implemented

- [x] ISR with `revalidate: 60`
- [x] `generateMetadata` for detail pages
- [x] Error Boundary on detail route
- [x] Pagination on `/users`
- [ ] Playwright E2E (optional stretch)

## License

Technical assessment submission — not for redistribution.  
Copyright © 2026 PT Mampu Inovasi Digital.
