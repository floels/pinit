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

  await page.waitForSelector('[data-testid="sidebar-home-link"]');
  // The seeded database has pins so at least one thumbnail should appear
  await page.waitForSelector('[data-testid="pin-thumbnail"]');
  const thumbnails = await page.$$('[data-testid="pin-thumbnail"]');
  expect(thumbnails.length).toBeGreaterThan(0);

  await expect(page.locator('[data-testid="sidebar-home-link"]')).toHaveClass(/navItemActive/);
  await expect(page.locator('[data-testid="sidebar-create-link"]')).not.toHaveClass(/navItemActive/);
});

test("shows unauthenticated state when the refresh token is invalid", async ({
  page,
  context,
}) => {
  // An invalid token causes POST /api/token/web/refresh/ to return 4xx,
  // so the startup refresh leaves accessToken null and the landing page is shown.
  await context.addCookies([
    {
      name: "refreshToken",
      value: "this.is.not.a.valid.jwt",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
    },
  ]);

  await page.goto("/");

  await page.waitForSelector("text=Log in");
});

