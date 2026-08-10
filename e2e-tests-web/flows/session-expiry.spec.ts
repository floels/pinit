import { test, expect, BrowserContext, Page } from "@playwright/test";
import path from "path";
import {
  E2E_TEST_USER_EMAIL,
  E2E_TEST_USER_PASSWORD,
  invalidateRefreshCookie,
  loginAsTestUser,
} from "../utils";

const PIN_IMAGE_PATH = path.join(__dirname, "../fixtures/pin_image_file.png");

// An authenticated-only route, so "the URL survived" means something: without
// the login prompt, 'PinCreationToolPage' sends a tokenless visitor home.
const AUTHENTICATED_ROUTE = "/pin-creation-tool";

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

const getRouteWithSearch = (page: Page) => {
  const url = new URL(page.url());

  return url.pathname + url.search;
};

// Drives the app into the expired state on an authenticated route, the way a
// real session ends: an authenticated request is rejected, and the refresh that
// follows fails too.
//
// The access token lasts 15 minutes, so a test cannot wait for it. Two steps
// stand in for that wait. The refresh cookie is replaced with a value the
// backend rejects, and the next authenticated request is answered with a 401.
// Everything after that point is the real code path.
const reachExpiredSession = async ({
  page,
  context,
}: {
  page: Page;
  context: BrowserContext;
}) => {
  await loginAsTestUser({ context });

  await page.goto(AUTHENTICATED_ROUTE);
  await page.waitForSelector("div[data-testid='pin-image-dropzone']");

  await markDocument(page);

  await invalidateRefreshCookie({ context });

  await page.route("**/pins/upload-url/*", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ errors: [{ code: "unauthorized" }] }),
    }),
  );

  // Publishing a pin is the authenticated request of this page. The 401 above
  // stops it before the backend writes anything.
  const fileInput = page.locator(
    "div[data-testid='pin-image-dropzone'] > input[type='file']",
  );
  await fileInput.setInputFiles(PIN_IMAGE_PATH);

  await page.click("text=Publish");

  // The login modal opens by itself, and it states the reason.
  await page.waitForSelector(
    '[data-testid="login-form-session-expired-message"]',
  );
};

test(`an expired session prompts a login and keeps the route,
without reloading the document`, async ({ page, context }) => {
  await reachExpiredSession({ page, context });

  expect(getRouteWithSearch(page)).toBe(AUTHENTICATED_ROUTE);
  expect(await isSameDocument(page)).toBe(true);
});

test("a login from that prompt returns the user to the same route", async ({
  page,
  context,
}) => {
  await reachExpiredSession({ page, context });

  await page.fill(
    "div[data-testid='overlay-modal'] >> input[name='email']",
    E2E_TEST_USER_EMAIL,
  );
  await page.fill(
    "div[data-testid='overlay-modal'] >> input[name='password']",
    E2E_TEST_USER_PASSWORD,
  );
  await page.click('[data-testid="login-form-submit-button"]');

  // The page comes back on the same URL, and it is still the same document.
  await page.waitForSelector("div[data-testid='pin-image-dropzone']");

  expect(getRouteWithSearch(page)).toBe(AUTHENTICATED_ROUTE);
  expect(await isSameDocument(page)).toBe(true);
});

test("a declined prompt releases the route guard", async ({
  page,
  context,
}) => {
  await reachExpiredSession({ page, context });

  // Closing the modal counts as a decline. The prompt stops, so the
  // authenticated-only route sends the user home instead of holding its URL.
  await page.click('[data-testid="overlay-modal-close-button"]');

  await page.waitForURL("**/");

  await expect(page.locator("text=Log in").first()).toBeVisible();
  expect(await isSameDocument(page)).toBe(true);
});
