import { test, expect } from "@playwright/test";
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

test("access token is silently refreshed on page load when a session exists", async ({
  page,
  context,
}) => {
  // Inject a valid refreshToken cookie obtained via the real API.
  // On page load the auth provider calls POST /api/token/web/refresh/,
  // receives an access token, and shows the authenticated UI.
  await loginAsTestUser({ context });

  await page.goto("/");
  await page.waitForSelector('[data-testid="sidebar-home-link"]');
});

test("session persists across page refreshes", async ({ page, context }) => {
  await loginAsTestUser({ context });

  await page.goto("/");
  await page.waitForSelector('[data-testid="sidebar-home-link"]');

  await page.reload();

  // The auth provider re-runs on reload and exchanges the cookie again
  await page.waitForSelector('[data-testid="sidebar-home-link"]');
});

test("shows an error for a wrong password", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="header-log-in-button"]');
  await page.fill("div[data-testid='overlay-modal'] >> input[name='email']", E2E_TEST_USER_EMAIL);
  await page.fill("div[data-testid='overlay-modal'] >> input[name='password']", "wrongpassword");
  await page.click('[data-testid="login-form-submit-button"]');

  await page.waitForSelector("text=The password you entered is incorrect. Try again.");
});

test("shows an error for an unrecognised email address", async ({ page }) => {
  await page.goto("/");
  await page.click('[data-testid="header-log-in-button"]');
  await page.fill("div[data-testid='overlay-modal'] >> input[name='email']", "nobody@example.com");
  await page.fill("div[data-testid='overlay-modal'] >> input[name='password']", "anypassword");
  await page.click('[data-testid="login-form-submit-button"]');

  await page.waitForSelector("text=The email you entered does not belong to any account.");
});

test("logout navigates with the router, without reloading the document", async ({
  page,
  context,
}) => {
  await loginAsTestUser({ context });
  await page.goto("/");
  await page.waitForSelector('[data-testid="sidebar-home-link"]');

  // The mark disappears on a full page load.
  await page.evaluate(() => {
    (window as unknown as { __documentAlive?: boolean }).__documentAlive = true;
  });

  await page.click('[data-testid="account-options-button"]');
  await page.waitForSelector('[data-testid="account-options-flyout"]');
  await page.click('[data-testid="account-options-flyout-log-out-button"]');

  await page.waitForSelector("text=Log in");
  await page.waitForURL("**/");

  const isSameDocument = await page.evaluate(
    () =>
      (window as unknown as { __documentAlive?: boolean }).__documentAlive ===
      true,
  );
  expect(isSameDocument).toBe(true);
});
