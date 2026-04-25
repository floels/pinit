import { test } from "@playwright/test";
import path from "path";
import { loginAsTestUser } from "../utils";

const PIN_IMAGE_PATH = path.join(__dirname, "../fixtures/pin_image_file.png");

test("redirects to landing page when the user is not logged in", async ({ page }) => {
  await page.goto("/pin-creation-tool");

  await page.waitForSelector("text=Get your next");
});

test("publishes a pin and shows a success toast with a link to it", async ({
  page,
  context,
}) => {
  await loginAsTestUser({ context });

  await page.goto("/pin-creation-tool");
  await page.waitForSelector("div[data-testid='pin-image-dropzone']");

  const fileInput = page.locator(
    "div[data-testid='pin-image-dropzone'] > input[type='file']",
  );
  await fileInput.setInputFiles(PIN_IMAGE_PATH);

  await page.click("text=Publish");

  // Backend creates the pin, uploads the image to moto, and returns the unique_id.
  // The frontend renders a success toast with a link to /pin/<unique_id>.
  await page.waitForSelector('a[href^="/pin/"]');
});
