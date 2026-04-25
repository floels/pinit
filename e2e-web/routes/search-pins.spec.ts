import { test, expect } from "@playwright/test";

// Must match the SEARCH_SEED_TERM in seed_e2e_database.py
const SEARCH_TERM = "playwrightuniquesearch";

test("shows search results for a matching query", async ({ page }) => {
  await page.goto(`/search/pins?q=${SEARCH_TERM}`);

  await page.waitForSelector('[data-testid="pin-thumbnail"]');
  const thumbnails = await page.$$('[data-testid="pin-thumbnail"]');
  expect(thumbnails.length).toBeGreaterThan(0);
});

test("shows a 'no results' message when the query matches nothing", async ({ page }) => {
  await page.goto("/search/pins?q=thissearchtermdoesnotmatchanything42");

  await page.waitForSelector(
    "text=No pin matches your search. Try another search term!",
  );
});

test("shows an error when the search API call fails", async ({ page }) => {
  await page.route("**/api/search/**", (route) => route.abort());

  await page.goto(`/search/pins?q=${SEARCH_TERM}`);

  await page.waitForSelector(
    "text=An error occurred while attempting to retrieve your search results.",
  );
});

test("redirects to landing page when the search query is empty", async ({ page }) => {
  await page.goto("/search/pins?q=");

  await page.waitForSelector("text=Get your next");
});
