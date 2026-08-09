import { test, expect } from "@playwright/test";
import { createBoardForTestUser, loginAsTestUser } from "../utils";

const BOARD_NAME = "E2E Save Board";

test("user can save a pin into an existing board", async ({
  page,
  context,
}) => {
  await createBoardForTestUser(BOARD_NAME);

  await loginAsTestUser({ context });
  await page.goto("/");
  await page.waitForSelector('[data-testid="sidebar-home-link"]');
  await page.waitForSelector('[data-testid="pin-thumbnail"]');

  const firstPin = page.locator('[data-testid="pin-thumbnail"]').first();

  // Hover to reveal the Save button, which opens the flyout.
  await firstPin.hover();
  await page.click('[data-testid="pin-thumbnail-save-button"]');

  await page.waitForSelector('[data-testid="save-pin-flyout-board-buttons"]');

  // The account owns exactly one board, so the first button is the board
  // created above. The label is matched by position rather than by text,
  // because hovering the button shortens the board name.
  const boardButton = page
    .locator('[data-testid="save-pin-flyout-board-buttons"] button')
    .first();

  const savePinResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      /\/pins\/[^/]+\/saves\/$/.test(new URL(response.url()).pathname),
  );

  await boardButton.click();

  const savePinResponse = await savePinResponsePromise;

  expect(savePinResponse.status()).toBe(201);

  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  await expect(
    page.getByText("An error occurred while attempting to save this pin."),
  ).toHaveCount(0);
});
