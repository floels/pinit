import { test } from "@playwright/test";

// Matches the unique_id set by the seed_e2e_database management command
const SEEDED_PIN_ID = "e2e70001-0000-4000-8000-000000000001";

test("shows pin details for an existing pin", async ({ page }) => {
  await page.goto(`/pin/${SEEDED_PIN_ID}`);

  // Unauthenticated users can still view pin details
  await page.waitForSelector("text=Log in");

  await page.waitForSelector('text="Pin title"');
  await page.waitForSelector('text="Pin description."');
  await page.waitForSelector('text="John Doe"');
  // The main pin image uses the title as its alt text
  await page.waitForSelector('img[alt="Pin title"]');
});

test("shows a 'pin not found' error for a non-existent pin", async ({ page }) => {
  await page.goto("/pin/000000000000000");

  await page.waitForSelector("text=We couldn't find the pin you are looking for.");
});
