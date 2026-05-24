import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "../utils";

test("user can create a new board from the save pin flyout", async ({
  page,
  context,
}) => {
  await loginAsTestUser({ context });
  await page.goto("/");
  await page.waitForSelector('[data-testid="sidebar-home-link"]');

  // Wait for at least one pin to appear in the grid
  await page.waitForSelector('[data-testid="pin-thumbnail"]');

  const firstPin = page.locator('[data-testid="pin-thumbnail"]').first();

  // Hover to reveal the Save button
  await firstPin.hover();
  await page.waitForSelector('[data-testid="pin-thumbnail-save-button"]');

  await page.click('[data-testid="pin-thumbnail-save-button"]');

  // The flyout should open with the "+ Create board" button
  await page.waitForSelector('[data-testid="save-pin-flyout-create-board-button"]');

  await page.click('[data-testid="save-pin-flyout-create-board-button"]');

  // The create board modal should appear
  await page.waitForSelector('[data-testid="create-board-modal"]');

  const boardName = `My E2E Board ${Date.now()}`;
  await page.fill('[data-testid="create-board-name-input"]', boardName);

  await page.click('[data-testid="create-board-submit-button"]');

  // Modal should close and success toast should appear
  await expect(page.locator('[data-testid="create-board-modal"]')).toBeHidden();
  await page.waitForSelector('[data-testid="board-created-toast-message"]');

  // The "View" link should navigate to the new board
  const viewLink = page.locator('[data-testid="board-created-toast-view-link"]');
  await expect(viewLink).toBeVisible();

  await viewLink.click();

  // Should navigate to the board page
  await page.waitForURL(/\/e2etestuser\/.+\//);
  await expect(page).toHaveURL(/\/e2etestuser\/.+\//);
});
