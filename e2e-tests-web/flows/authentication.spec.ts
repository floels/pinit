import { test } from "@playwright/test";
import { loginAsTestUser, E2E_TEST_USER_EMAIL, E2E_TEST_USER_PASSWORD } from "../utils";

test("user can log in and then log out", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("text=Log in");

  await page.click('[data-testid="header-log-in-button"]');
  await page.fill("div[data-testid='overlay-modal'] >> input[name='email']", E2E_TEST_USER_EMAIL);
  await page.fill("div[data-testid='overlay-modal'] >> input[name='password']", E2E_TEST_USER_PASSWORD);
  await page.click('[data-testid="login-form-submit-button"]');

  // After login the page reloads; the auth provider picks up the new
  // refresh cookie, exchanges it for an access token → authenticated header
  await page.waitForSelector('[data-testid="sidebar-home-link"]');

  await page.click('[data-testid="account-options-button"]');
  await page.waitForSelector('[data-testid="account-options-flyout"]');
  await page.click('[data-testid="account-options-flyout-log-out-button"]');

  await page.waitForSelector("text=Log in");

  // Navigating back should remain unauthenticated (cookie deleted on logout)
  await page.goto("/");
  await page.waitForSelector("text=Log in");
});
