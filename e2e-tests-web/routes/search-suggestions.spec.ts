import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "../utils";

// The seeded pins are titled "Sample pin N playwrightuniquesearch"
// (see SEARCH_SEED_TERM in seed_database_e2e.py), so "playwrightuniquesearch"
// is a word Elasticsearch should suggest for the prefix below.
const SUGGESTION_PREFIX = "playwrightunique";
const EXPECTED_SUGGESTION = "playwrightuniquesearch";

test("autocompletes the search term from indexed pins", async ({
  context,
  page,
}) => {
  await loginAsTestUser({ context });
  await page.goto("/");

  await page.locator('[data-testid="search-bar-input"]').fill(SUGGESTION_PREFIX);

  // The suggestions come from the Elasticsearch terms aggregation over indexed
  // pins. The frontend prepends the raw typed term as the first suggestion, so
  // asserting on the fuller word proves it was returned by the backend rather
  // than echoed from the input.
  const suggestion = page
    .locator('[data-testid="search-suggestions-list-item"]')
    .filter({ hasText: EXPECTED_SUGGESTION });

  await expect(suggestion).toBeVisible();
});
