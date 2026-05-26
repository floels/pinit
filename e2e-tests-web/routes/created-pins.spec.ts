import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "../utils";

test("user can view, edit and delete created pins", async ({
  context,
  page,
}) => {
  await loginAsTestUser({ context });
  await page.goto("/e2etestuser");

  // Both seeded pins appear on the Created tab
  await expect(page.locator('[data-testid="pin-thumbnail"]')).toHaveCount(2);
  await expect(page.getByText("Pin to edit")).toBeVisible();
  await expect(page.getByText("Pin to delete")).toBeVisible();

  // Edit one pin
  await page
    .locator('[data-testid="pin-thumbnail"]')
    .filter({ hasText: "Pin to edit" })
    .locator('[data-testid="pin-thumbnail-edit-button"]')
    .click();

  await page.waitForSelector('[data-testid="edit-pin-panel"]');
  await expect(
    page.locator('[data-testid="edit-pin-title-input"]'),
  ).toHaveValue("Pin to edit");

  await page.locator('[data-testid="edit-pin-title-input"]').fill("Edited pin title");
  await page
    .locator('[data-testid="edit-pin-description-textarea"]')
    .fill("Edited description.");
  await page.click('[data-testid="edit-pin-save-button"]');

  await expect(page.locator('[data-testid="edit-pin-panel"]')).toBeHidden();
  await expect(page.getByText("Edited pin title")).toBeVisible();

  // Delete the other pin
  await page
    .locator('[data-testid="pin-thumbnail"]')
    .filter({ hasText: "Pin to delete" })
    .locator('[data-testid="pin-thumbnail-edit-button"]')
    .click();

  await page.waitForSelector('[data-testid="edit-pin-panel"]');
  await page.click('[data-testid="edit-pin-delete-button"]');

  await expect(page.locator('[data-testid="edit-pin-panel"]')).toBeHidden();
  await expect(page.getByText("Pin to delete")).toBeHidden();
  await expect(page.locator('[data-testid="pin-thumbnail"]')).toHaveCount(1);
});
