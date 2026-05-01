import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "../utils";

test("shows landing page and unauthenticated header when not logged in", async ({ page }) => {
  await page.goto("/");

  await page.waitForSelector("text=Log in");
  await page.waitForSelector("text=Get your next");
});

test("shows authenticated header and pin suggestions when logged in", async ({
  page,
  context,
}) => {
  await loginAsTestUser({ context });

  await page.goto("/");

  await page.waitForSelector("nav >> text=Home");
  // The seeded database has pins so at least one thumbnail should appear
  await page.waitForSelector('[data-testid="pin-thumbnail"]');
  const thumbnails = await page.$$('[data-testid="pin-thumbnail"]');
  expect(thumbnails.length).toBeGreaterThan(0);

  await expect(page.locator("nav a", { hasText: "Home" })).toHaveClass(/navigationItemActive/);
  await expect(page.locator("nav a", { hasText: "Create" })).not.toHaveClass(/navigationItemActive/);
});

test("shows unauthenticated state when the refresh token is invalid", async ({
  page,
  context,
}) => {
  // An invalid token causes POST /api/token/web/refresh/ to return 4xx,
  // so AccessTokenRefresher leaves accessToken null and the landing page is shown.
  await context.addCookies([
    {
      name: "refreshToken",
      value: "this.is.not.a.valid.jwt",
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
    },
  ]);

  await page.goto("/");

  await page.waitForSelector("text=Log in");
});

