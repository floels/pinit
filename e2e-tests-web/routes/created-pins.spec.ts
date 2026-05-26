import { test, expect } from "@playwright/test";
import { loginAsTestUser } from "../utils";

const USERNAME = "e2etestuser";

test.beforeEach(async ({ context, page }) => {
  await loginAsTestUser({ context });
  await page.goto(`/${USERNAME}`);
  await page.waitForSelector('[data-testid="pin-thumbnail"]');
});

test("shows created pins on the profile page", async ({ page }) => {
  await expect(page.locator('[data-testid="pin-thumbnail"]')).toHaveCount(2);
  await expect(page.getByText("Pin to edit")).toBeVisible();
  await expect(page.getByText("Pin to delete")).toBeVisible();
});

test("user can edit a created pin's title and description", async ({ page }) => {
  const editButton = page
    .locator('[data-testid="pin-thumbnail"]')
    .filter({ hasText: "Pin to edit" })
    .locator('[data-testid="pin-thumbnail-edit-button"]');

  await editButton.click();

  await page.waitForSelector('[data-testid="edit-pin-panel"]');

  const titleInput = page.locator('[data-testid="edit-pin-title-input"]');
  await expect(titleInput).toHaveValue("Pin to edit");

  await titleInput.fill("Edited pin title");

  const descriptionTextarea = page.locator(
    '[data-testid="edit-pin-description-textarea"]',
  );
  await descriptionTextarea.fill("Edited description.");

  await page.click('[data-testid="edit-pin-save-button"]');

  await expect(page.locator('[data-testid="edit-pin-panel"]')).toBeHidden();
  await expect(page.getByText("Edited pin title")).toBeVisible();
});

test("user can delete a created pin", async ({ page }) => {
  const pinToDelete = page
    .locator('[data-testid="pin-thumbnail"]')
    .filter({ hasText: "Pin to delete" });

  await expect(pinToDelete).toBeVisible();

  await pinToDelete
    .locator('[data-testid="pin-thumbnail-edit-button"]')
    .click();

  await page.waitForSelector('[data-testid="edit-pin-panel"]');
  await page.click('[data-testid="edit-pin-delete-button"]');

  await expect(page.locator('[data-testid="edit-pin-panel"]')).toBeHidden();
  await expect(page.getByText("Pin to delete")).toBeHidden();
});
