import { test, expect } from "@playwright/test";

// Must match the SEARCH_SEED_TERM and NUMBER_OF_SEARCH_PINS in seed_database_e2e.py
const SEARCH_TERM = "playwrightuniquesearch";
const NUMBER_OF_SEARCH_PINS = 3;

// A term that is structurally impossible to match any seeded pin.
const NO_RESULTS_TERM = "00000000-0000-0000-0000-000000000000";

test("shows search results for a matching query", async ({ page }) => {
  await page.goto(`/search/pins?q=${SEARCH_TERM}`);

  await page.waitForSelector('[data-testid="pin-thumbnail"]');

  const thumbnails = page.locator('[data-testid="pin-thumbnail"]');
  await expect(thumbnails).toHaveCount(NUMBER_OF_SEARCH_PINS);

  // Each result's image alt text should include the search term (titles are
  // "Sample pin N playwrightuniquesearch" — see seed_database_e2e.py).
  const images = page.locator('[data-testid="pin-thumbnail-image"] img');
  for (const image of await images.all()) {
    await expect(image).toHaveAttribute("alt", new RegExp(SEARCH_TERM, "i"));
  }
});

test("shows a 'no results' message when the query matches nothing", async ({ page }) => {
  await page.goto(`/search/pins?q=${NO_RESULTS_TERM}`);

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
