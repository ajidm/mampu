# Product Requirements Document (PRD)

**Project:** Mampu User Operations  
**Version:** 1.0  
**Date:** 2026-05-08  
**Author:** Technical Assignment – PT Mampu Inovasi Digital  

---

## 1. Overview

This document describes the product requirements for the **Mampu User Operations** web application. The application is a single product built on Next.js that fetches, enriches, and displays user data from a public REST API (JSONPlaceholder). Its primary purpose is to demonstrate clean architecture, thoughtful UX, and testable code.

---

## 2. Goals & Objectives

| # | Goal |
|---|---|
| G1 | Provide a clear, navigable list of users enriched with activity signals (posts, todos) |
| G2 | Allow users to quickly find a specific user via search and filter controls |
| G3 | Surface full user detail — contact info, company, address, posts, todos — on a dedicated page |
| G4 | Ensure the interface is responsive and usable on desktop and mobile |
| G5 | Maintain performance through ISR caching and loading skeletons |
| G6 | Deliver reliable behavior with proper error handling for failed requests and invalid routes |

---

## 3. Scope

### In Scope
- `/users` – Users list page with search, filter, sort, pagination, and activity enrichment
- `/users/[id]` – User detail page with posts and todos sections
- Skeleton loading states and empty-state messaging
- Unit tests (Jest + RTL) for list and detail pages
- ISR cache revalidation (60 s)
- SEO metadata via `generateMetadata`

### Out of Scope
- Authentication / authorization
- Write operations (create, update, delete users)
- Real backend or database — JSONPlaceholder is the sole data source
- Internationalisation (i18n)

---

## 4. User Stories

### 4.1 Users List

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-01 | Visitor | See a list of all users | I can browse who is registered |
| US-02 | Visitor | Search users by name or email | I can quickly find a specific person |
| US-03 | Visitor | Sort the list by name (A→Z / Z→A) | I can scan the list alphabetically |
| US-04 | Visitor | Filter by users with pending todos | I can see who has outstanding work |
| US-05 | Visitor | Sort by most pending todos | I can prioritise who needs attention |
| US-06 | Visitor | See total posts, completed todos, and pending todos per user | I can gauge each user's activity at a glance |
| US-07 | Visitor | Navigate between pages of users | I can handle large lists without scrolling forever |
| US-08 | Visitor | See a skeleton while data loads | I know the page is working |
| US-09 | Visitor | See an error message if the request fails | I am not left with a blank screen |
| US-10 | Visitor | See an empty-state message when no users match my filter | I know the filter worked, not that the page broke |

### 4.2 User Detail

| ID | As a… | I want to… | So that… |
|---|---|---|---|
| US-11 | Visitor | Click a user row and land on their detail page | I can read full contact and company info |
| US-12 | Visitor | See the user's posts on the detail page | I can read what they have written |
| US-13 | Visitor | See the user's todos on the detail page | I can see their task completion status |
| US-14 | Visitor | Navigate back to the list with my previous search/filter intact | I do not lose context when exploring a user |
| US-15 | Visitor | See a 404-style error when the user id is invalid | I get clear feedback rather than a broken page |
| US-16 | Visitor | See a skeleton while the detail loads | I know the page is working |

---

## 5. Functional Requirements

### FR-01 Users List Page (`/users`)
- **FR-01.1** Fetch all users from `https://jsonplaceholder.typicode.com/users` with ISR revalidation every 60 s.
- **FR-01.2** Fetch all posts and all todos, then compute per-user: `totalPosts`, `completedTodos`, `pendingTodos`.
- **FR-01.3** Display a responsive table on desktop (columns: Name, Email, Website, Posts, Completed, Pending) and a card layout on mobile.
- **FR-01.4** Provide a search input that filters the list client-side by name or email (case-insensitive, debounced 300 ms).
- **FR-01.5** Provide a sort control: Name A→Z, Name Z→A, Most Pending Todos, Most Posts.
- **FR-01.6** Provide a filter control: All Users | Has Pending Todos | No Completed Todos.
- **FR-01.7** Each user row/card must be a link to `/users/[id]`.
- **FR-01.8** Search, sort, and filter values must be serialised to URL query params so state survives browser back-navigation.
- **FR-01.9** Show a skeleton table/card grid while data is loading.
- **FR-01.10** Show an inline error alert if any of the three fetches fail.
- **FR-01.11** Show an empty-state illustration + message when filters produce no results.
- **FR-01.12** Paginate at 10 users per page; show prev/next controls.

### FR-02 User Detail Page (`/users/[id]`)
- **FR-02.1** Fetch user, user posts, and user todos in parallel on the server.
- **FR-02.2** Display a card with: Name, Username, Email, Phone, Website, Company (name + catchphrase), Address (street, suite, city, zipcode).
- **FR-02.3** Display a collapsible Posts section listing post titles (expand to show body).
- **FR-02.4** Display a Todos section with a progress bar showing completion ratio; list individual todos with a checked/unchecked icon.
- **FR-02.5** Include a "← Back to list" link that returns to `/users` preserving previous query params.
- **FR-02.6** Show a skeleton card while loading.
- **FR-02.7** Return a styled 404 page when the user id does not exist or is non-numeric.
- **FR-02.8** Expose `generateMetadata` returning `{ title: "<Name> | Mampu Users", description: "<catchphrase>" }`.

---

## 6. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Performance | List page initial load ≤ 2 s on a 4G connection (aided by ISR) |
| NFR-02 | Accessibility | All interactive elements must have visible focus states; table must use `<th scope>` |
| NFR-03 | Responsiveness | Layout must be usable at 375 px (mobile) and 1440 px (desktop) |
| NFR-04 | Test Coverage | Unit tests must cover: render, search filter, activity-sort filter, loading state, error state, empty state, invalid id |
| NFR-05 | Code Quality | No TypeScript `any`; ESLint must pass with zero errors |
| NFR-06 | SEO | Each detail page must have unique `<title>` and `<meta description>` |

---

## 7. Constraints

- Data source is read-only (JSONPlaceholder); no write operations.
- No authentication layer required.
- Must use Next.js 16 with App Router (no Pages Router).
- Must use Tailwind CSS for styling.

---

## 8. Assumptions

- JSONPlaceholder always returns consistent userId references across users, posts, and todos.
- User IDs are integers 1–10 in the seed data.
- The application is a single-developer project for assessment purposes; no CI/CD pipeline is required.
