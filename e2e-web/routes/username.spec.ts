import { test } from "@playwright/test";

test("shows public account details for an existing username", async ({ page }) => {
  // The seed_e2e_database command creates this account with known fields
  await page.goto("/johndoe");

  await page.waitForSelector("text=Log in");

  await page.waitForSelector('img[alt="Profile picture of John Doe"]');
  await page.waitForSelector('text="John Doe"');
  await page.waitForSelector('text="johndoe"');
  await page.waitForSelector('text="Description for account of John Doe."');
});

test("shows an 'account not found' error for a non-existent username", async ({ page }) => {
  await page.goto("/doesnotexist12345");

  await page.waitForSelector("text=We couldn't find the account you are looking for.");
});
