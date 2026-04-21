import { test } from "@playwright/test";
import { Response, Express } from "express";
import en from "@/messages/en.json";
import { launchMockAPIServer } from "@/e2e-tests/utils";

const EMAIL_FIXTURE = "john.doe@example.com";
const PASSWORD_FIXTURE = "Pa$$w0rd";
const BIRTHDATE_FIXTURE = "1970-01-01";

const configureAPIResponses = (mockAPIApp: Express) => {
  mockAPIApp.post("/api/signup/", (_, response: Response) => {
    response.json({
      access_token: "mock_access_token",
      refresh_token: "mock_refresh_token",
    });
  });
};

test("user should be able to sign up", async ({ page }) => {
  const mockAPIServer = await launchMockAPIServer(configureAPIResponses);

  await page.goto("/");

  await page.click('[data-testid="header-sign-up-button"]');

  await page.fill(
    "div[data-testid='overlay-modal'] >> input[name='email']",
    EMAIL_FIXTURE,
  );
  await page.fill(
    "div[data-testid='overlay-modal'] >> input[name='password']",
    PASSWORD_FIXTURE,
  );
  await page.fill(
    "div[data-testid='overlay-modal'] >> input[name='birthdate']",
    BIRTHDATE_FIXTURE,
  );

  await page.click(
    `div[data-testid='overlay-modal'] >> text=${en.LandingPageContent.SignupForm.CONTINUE}`,
  );

  // We should land on authenticated homepage
  await page.waitForSelector('[data-testid="search-bar-input"]');

  // If we visit the base route again, we should still land on the authenticated homepage
  await page.goto("/");

  await page.waitForSelector('[data-testid="search-bar-input"]');

  mockAPIServer.close();
});
