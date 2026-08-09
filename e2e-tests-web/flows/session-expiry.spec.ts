import { test, expect, Page } from "@playwright/test";
import {
  createBoardForTestUser,
  invalidateRefreshCookie,
  loginAsTestUser,
} from "../utils";

const BOARD_NAME = "E2E Expiry Board";
const SEARCH_URL = "/search/pins?q=playwrightuniquesearch";

type MarkedWindow = { __documentAlive?: boolean };

// Marks the current document. The mark disappears on a full page load, so it
// tells a client-side transition apart from a reload.
const markDocument = (page: Page) =>
  page.evaluate(() => {
    (window as unknown as MarkedWindow).__documentAlive = true;
  });

const isSameDocument = (page: Page) =>
  page.evaluate(
    () => (window as unknown as MarkedWindow).__documentAlive === true,
  );

test(`an expired session keeps the route and prompts a login,
without reloading the document`, async ({ page, context }) => {
  await createBoardForTestUser(BOARD_NAME);
  await loginAsTestUser({ context });

  // A route other than '/', so that "the URL survived" means something.
  await page.goto(SEARCH_URL);
  await page.waitForSelector('[data-testid="sidebar-home-link"]');
  await page.waitForSelector('[data-testid="pin-thumbnail"]');

  await markDocument(page);

  // Set up the expiry: the refresh cookie stops working, and the next
  // authenticated request is rejected, exactly as it is once the access token
  // reaches its 15-minute limit.
  await invalidateRefreshCookie({ context });
  await page.route("**/saves/", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ errors: [{ code: "unauthorized" }] }),
    }),
  );

  // Trigger an authenticated request: save the pin into the board.
  const firstPin = page.locator('[data-testid="pin-thumbnail"]').first();
  await firstPin.hover();
  await page.click('[data-testid="pin-thumbnail-save-button"]');
  await page.waitForSelector('[data-testid="save-pin-flyout-board-buttons"]');
  await page
    .locator('[data-testid="save-pin-flyout-board-buttons"] button')
    .first()
    .click();

  // The login modal opens by itself and states the reason.
  await page.waitForSelector('[data-testid="login-form-session-expired-message"]');

  // The route is intact, and this is still the same document.
  expect(new URL(page.url()).pathname + new URL(page.url()).search).toBe(
    SEARCH_URL,
  );
  expect(await isSameDocument(page)).toBe(true);
});

test("a session that never existed still redirects off an authenticated route", async ({
  page,
}) => {
  // The counterpart of the test above: without an expiry, '/pin-creation-tool'
  // must still send an anonymous visitor home.
  await page.goto("/pin-creation-tool");

  await page.waitForURL("**/");
  await page.waitForSelector("text=Log in");
});
