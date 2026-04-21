import { test, expect } from "@playwright/test";
import { Response, Express } from "express";
import en from "@/messages/en.json";
import { addAccessTokenTookie, launchMockAPIServer } from "../utils";
import {
  API_ROUTE_PIN_SUGGESTIONS,
  ERROR_CODE_UNAUTHORIZED,
} from "@/lib/constants";
import { MOCK_API_RESPONSES_JSON } from "@/lib/testing-utils/mockAPIResponses";

test("should display unauthenticated header and landing page content if user is not logged in", async ({
  page,
}) => {
  await page.goto("/");

  await page.waitForSelector(`text=${en.HeaderUnauthenticated.LOG_IN}`);
  await page.waitForSelector(
    `text=${en.LandingPageContent.PictureSlider.GET_YOUR_NEXT}`,
  );
});

test("should display authenticated header and pin suggestions if user is logged in", async ({
  page,
  context,
}) => {
  const configureAPIResponses = (mockAPIApp: Express) => {
    mockAPIApp.get("/api/pin-suggestions/", (_, response: Response) => {
      response.json(MOCK_API_RESPONSES_JSON[API_ROUTE_PIN_SUGGESTIONS]);
    });
  };

  const mockAPIServer = await launchMockAPIServer(configureAPIResponses);

  addAccessTokenTookie({ context });

  await page.goto("/");

  const header = page.locator("nav");
  await header
    .locator(`text=${en.HeaderAuthenticated.NAV_ITEM_HOME}`)
    .waitFor();

  await page.waitForSelector('[data-testid="pin-thumbnail"]');
  const pinSuggestions = await page.$$('[data-testid="pin-thumbnail"]');
  expect(pinSuggestions.length).toBe(
    MOCK_API_RESPONSES_JSON[API_ROUTE_PIN_SUGGESTIONS].results.length,
  );

  mockAPIServer.close();
});

test("should log user out upon 401 response from 'pin-suggestions/' endpoint", async ({
  page,
  context,
}) => {
  const configureAPIResponses = (mockAPIApp: Express) => {
    mockAPIApp.get("/api/pin-suggestions/", (_, response: Response) => {
      response.status(401).json({
        errors: [{ code: ERROR_CODE_UNAUTHORIZED }],
      });
    });
  };

  const mockAPIServer = await launchMockAPIServer(configureAPIResponses);

  addAccessTokenTookie({ context });

  await page.goto("/");

  await page.waitForSelector(`text=${en.HeaderUnauthenticated.LOG_IN}`);

  mockAPIServer.close();
});

test("should display error message when API is unreachable", async ({
  page,
  context,
}) => {
  // We set an 'accessToken' cookie so that the Next.js server
  // attempts to reach the API:
  addAccessTokenTookie({ context });

  await page.goto("/");

  await page.waitForSelector(
    `text=${en.HomePageContent.ERROR_FETCH_PIN_SUGGESTIONS}`,
  );
});
