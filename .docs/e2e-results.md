# E2E Test Results

**Date:** 2026-05-08  
**Tool:** Playwright 1.59.1  
**Browser:** Chromium (Desktop Chrome)  
**Base URL:** http://localhost:3001  
**Test file:** `e2e/happy-path.spec.ts`  
**Duration:** ~5.6s  

---

## Summary

| Status | Count |
|--------|-------|
| ✅ Passed | 16 |
| ❌ Failed | 0 |
| **Total** | **16** |

---

## Results by Suite

### Users list page (9 tests)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 1 | renders the page heading | ✅ Pass | 1.1s |
| 2 | displays at least one user row | ✅ Pass | 1.1s |
| 3 | search by name filters the list | ✅ Pass | 1.2s |
| 4 | search with no match shows empty state | ✅ Pass | 1.2s |
| 5 | clear filters button in empty state resets search | ✅ Pass | 0.9s |
| 6 | Pending dropdown filters out users with zero pending todos | ✅ Pass | 0.8s |
| 7 | Posts dropdown filters correctly | ✅ Pass | 0.8s |
| 8 | sorting by Name header toggles order | ✅ Pass | 0.9s |
| 9 | pagination shows next page | ✅ Pass | 0.7s |

### User detail page (5 tests)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 10 | navigating to a user shows profile fields | ✅ Pass | 1.5s |
| 11 | Posts and Todos sections are present | ✅ Pass | 1.1s |
| 12 | Back to list link returns to /users | ✅ Pass | 1.3s |
| 13 | invalid user id shows not-found page | ✅ Pass | 0.8s |
| 14 | non-numeric id shows not-found page | ✅ Pass | 0.4s |

### Filter state persistence (2 tests)

| # | Test | Status | Duration |
|---|------|--------|----------|
| 15 | filters are cleared on hard refresh | ✅ Pass | 0.7s |
| 16 | filters are preserved when navigating back from detail page | ✅ Pass | 0.8s |

---

## Coverage

| Area | Tests |
|------|-------|
| Page load & heading | ✅ |
| User list rendering | ✅ |
| Search by name | ✅ |
| Search by email | — (covered by unit tests) |
| Empty search state | ✅ |
| Clear filters action | ✅ |
| Pending dropdown filter | ✅ |
| Posts dropdown filter | ✅ |
| Sort by name toggle | ✅ |
| Pagination | ✅ |
| User detail — profile fields | ✅ |
| User detail — Posts section | ✅ |
| User detail — Todos section | ✅ |
| Back to list navigation | ✅ |
| Not found — invalid numeric id | ✅ |
| Not found — non-numeric id | ✅ |
| Filter reset on hard refresh | ✅ |
| Filter preserved on back-navigation | ✅ |

---

## Setup Notes

- **Config:** `playwright.config.ts` — `webServer` set to `reuseExistingServer: true`, targets port 3001
- **Browsers:** Chromium only (Desktop Chrome profile)
- **Run command:** `npm run test:e2e` or `npx playwright test`
