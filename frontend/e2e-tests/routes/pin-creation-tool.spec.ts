import { test } from "@playwright/test";
import { Request, Response, Express } from "express";
import en from "@/messages/en.json";
import { addAccessTokenTookie, launchMockAPIServer } from "../utils";
import path from "path";
import { Server } from "http";

const ID_CREATED_PIN = "123456789012345";

const configureAPIResponses = (mockAPIApp: Express) => {
  mockAPIApp.post("/api/token/refresh/", (_, response: Response) => {
    response.json({
      access_token: "refreshed_access_token",
    });
  });

  mockAPIApp.post("/api/create-pin", (request: Request, response: Response) => {
    response.status(201).json({
      unique_id: ID_CREATED_PIN,
    });
  });
};

let mockAPIServer: Server;

test.beforeAll(async () => {
  mockAPIServer = await launchMockAPIServer(configureAPIResponses);
});

test.afterAll(() => {
  mockAPIServer.close();
});

test("should redirect to landing page if user is not logged in", async ({
  page,
}) => {
  await page.goto("/pin-creation-tool");

  await page.waitForSelector(
    `text=${en.LandingPageContent.PictureSlider.GET_YOUR_NEXT}`,
  );
});

test("should display success toast with link to newly-created pin upon successful creation", async ({
  page,
  context,
}) => {
  addAccessTokenTookie({ context });

  await page.goto("/pin-creation-tool");

  await page.waitForSelector("div[data-testid='pin-image-dropzone']");

  // Attach file: see https://playwright.dev/docs/api/class-locator#locator-set-input-files
  const fileInput = page.locator(
    "div[data-testid='pin-image-dropzone'] > input[type='file']",
  );

  const imageFilePath = path.join(__dirname, "../fixtures/pin_image_file.png");
  await fileInput.setInputFiles(imageFilePath);

  await page.click(`text=${en.PinCreation.PUBLISH}`);

  await page.waitForSelector(`a[href="/pin/${ID_CREATED_PIN}"]`);
});
