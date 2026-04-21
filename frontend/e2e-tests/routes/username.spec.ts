import { Server } from "http";
import { test } from "@playwright/test";
import { Response, Express } from "express";
import { launchMockAPIServer } from "../utils";
import en from "@/messages/en.json";
import { MOCK_API_RESPONSES_JSON } from "@/lib/testing-utils/mockAPIResponses";
import { API_ENDPOINT_ACCOUNT_DETAILS } from "@/lib/constants";

const configureAPIResponses = (mockAPIApp: Express) => {
  mockAPIApp.get("/api/accounts/johndoe/", (_, response: Response) => {
    response.json(MOCK_API_RESPONSES_JSON[API_ENDPOINT_ACCOUNT_DETAILS]);
  });

  mockAPIApp.get("/api/accounts/badrequest/", (_, response: Response) => {
    response.status(400).json({});
  });
};

let mockAPIServer: Server;

test.beforeAll(async () => {
  mockAPIServer = await launchMockAPIServer(configureAPIResponses);
});

test.afterAll(() => {
  mockAPIServer.close();
});

test("should display account details", async ({ page }) => {
  await page.goto("/johndoe");

  await page.waitForSelector(`text=${en.HeaderUnauthenticated.LOG_IN}`);

  await page.waitForSelector('img[alt="Profile picture of John Doe"]');

  await page.waitForSelector('text="John Doe"');
  await page.waitForSelector('text="johndoe"');
  await page.waitForSelector('text="Description for account of John Doe."');
});

test("should display 'account not found' error in case of 404 response from the API", async ({
  page,
}) => {
  await page.goto("/doesnotexist");

  await page.waitForSelector(
    `text=${en.AccountDetails.ERROR_ACCOUNT_NOT_FOUND}`,
  );
});

test("should display generic error in case of 400 response from the API", async ({
  page,
}) => {
  await page.goto("/badrequest");

  await page.waitForSelector(
    `text=${en.AccountDetails.ERROR_FETCH_ACCOUNT_DETAILS}`,
  );
});
