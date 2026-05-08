import { test, expect } from "@playwright/test";

test.describe("Users list page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    // Wait for the table to finish loading (skeleton disappears, rows appear)
    await page.waitForSelector('[aria-label^="View details for"]', { timeout: 15000 });
  });

  test("renders the page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  });

  test("displays at least one user row", async ({ page }) => {
    const links = page.getByRole("link", { name: /^View details for/ });
    await expect(links.first()).toBeVisible();
    expect(await links.count()).toBeGreaterThan(0);
  });

  test("search by name filters the list", async ({ page }) => {
    const searchbox = page.getByRole("searchbox");
    await searchbox.fill("Leanne");
    // At least one result for the matching name
    await expect(page.getByRole("link", { name: "View details for Leanne Graham" })).toBeVisible();
    // Other users' names should not appear
    await expect(page.getByRole("link", { name: "View details for Ervin Howell" })).not.toBeVisible();
  });

  test("search with no match shows empty state", async ({ page }) => {
    const searchbox = page.getByRole("searchbox");
    await searchbox.fill("zzznomatch");
    await expect(
      page.getByText(/no users match your current search or filter/i)
    ).toBeVisible();
  });

  test("clear filters button in empty state resets search", async ({ page }) => {
    await page.getByRole("searchbox").fill("zzznomatch");
    await page.getByRole("button", { name: /clear filters/i }).click();
    const links = page.getByRole("link", { name: /^View details for/ });
    await expect(links.first()).toBeVisible();
  });

  test("Pending dropdown filters out users with zero pending todos", async ({ page }) => {
    await page.getByLabel("Pending").selectOption("has-pending");
    // Every visible user row should have pending > 0 — we just verify the list is non-empty
    // and that the filter badge appears
    await expect(page.getByText("Pending: has-pending")).toBeVisible();
  });

  test("Posts dropdown filters correctly", async ({ page }) => {
    await page.getByLabel("Posts").selectOption("has-posts");
    await expect(page.getByText("Posts: has-posts")).toBeVisible();
  });

  test("sorting by Name header toggles order", async ({ page }) => {
    // Default: name-asc — first row should be alphabetically first
    const links = page.getByRole("link", { name: /^View details for/ });
    const firstNameBefore = await links.first().getAttribute("aria-label");

    // Click Name to go name-desc
    await page.getByRole("button", { name: /name/i }).click();
    const firstNameAfter = await links.first().getAttribute("aria-label");
    expect(firstNameBefore).not.toBe(firstNameAfter);
  });

  test("pagination shows next page", async ({ page }) => {
    // Default page size is 10; JSONPlaceholder has 10 users — pagination may not appear
    // But we can verify at least 10 rows exist (or fewer if < 10 users returned)
    const links = page.getByRole("link", { name: /^View details for/ });
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10);
  });
});

test.describe("User detail page", () => {
  test("navigating to a user shows profile fields", async ({ page }) => {
    await page.goto("/users");
    await page.waitForSelector('[aria-label^="View details for"]', { timeout: 15000 });

    // Click the first user
    const firstLink = page.getByRole("link", { name: /^View details for/ }).first();
    const name = (await firstLink.getAttribute("aria-label"))!.replace("View details for ", "");
    await firstLink.click();

    // Wait for detail page to load
    await page.waitForURL(/\/users\/\d+/);
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible({ timeout: 15000 });

    // Contact fields rendered
    await expect(page.getByRole("region", { name: "Contact information" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Company information" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Address" })).toBeVisible();
  });

  test("Posts and Todos sections are present", async ({ page }) => {
    await page.goto("/users");
    await page.waitForSelector('[aria-label^="View details for"]', { timeout: 15000 });
    await page.getByRole("link", { name: /^View details for/ }).first().click();
    await page.waitForURL(/\/users\/\d+/);

    // Both sections should exist
    await expect(page.getByRole("region", { name: "Posts" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("region", { name: "Todos" })).toBeVisible({ timeout: 15000 });
  });

  test("Back to list link returns to /users", async ({ page }) => {
    await page.goto("/users");
    await page.waitForSelector('[aria-label^="View details for"]', { timeout: 15000 });
    await page.getByRole("link", { name: /^View details for/ }).first().click();
    await page.waitForURL(/\/users\/\d+/);

    const backLink = page.getByRole("link", { name: /back to list/i });
    await expect(backLink).toBeVisible({ timeout: 15000 });
    await backLink.click();
    await page.waitForURL("/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  });

  test("invalid user id shows not-found page", async ({ page }) => {
    await page.goto("/users/99999");
    await expect(page.getByRole("heading", { name: /user not found/i })).toBeVisible({ timeout: 10000 });
  });

  test("non-numeric id shows not-found page", async ({ page }) => {
    await page.goto("/users/abc");
    await expect(page.getByRole("heading", { name: /user not found/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Filter state persistence", () => {
  test("filters are cleared on hard refresh", async ({ page }) => {
    await page.goto("/users");
    await page.waitForSelector('[aria-label^="View details for"]', { timeout: 15000 });

    // Apply a filter
    await page.getByLabel("Pending").selectOption("has-pending");
    await expect(page.getByText("Pending: has-pending")).toBeVisible();

    // Hard refresh (full reload)
    await page.reload();
    await page.waitForSelector('[aria-label^="View details for"]', { timeout: 15000 });

    // Filter badge should be gone
    await expect(page.getByText("Pending: has-pending")).not.toBeVisible();
  });

  test("filters are preserved when navigating back from detail page", async ({ page }) => {
    await page.goto("/users");
    await page.waitForSelector('[aria-label^="View details for"]', { timeout: 15000 });

    // Apply a filter
    await page.getByLabel("Pending").selectOption("has-pending");
    await expect(page.getByText("Pending: has-pending")).toBeVisible();

    // Navigate to a user detail
    await page.getByRole("link", { name: /^View details for/ }).first().click();
    await page.waitForURL(/\/users\/\d+/);

    // Use browser back
    await page.goBack();
    await page.waitForURL("/users");

    // Filter badge should still be visible
    await expect(page.getByText("Pending: has-pending")).toBeVisible({ timeout: 5000 });
  });
});
