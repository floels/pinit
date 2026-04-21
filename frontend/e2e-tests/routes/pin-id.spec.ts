import { test } from "@playwright/test";
import { Response, Express } from "express";
import en from "@/messages/en.json";
import { launchMockAPIServer } from "../utils";
import { MOCK_API_RESPONSES_JSON } from "@/lib/testing-utils/mockAPIResponses";
import { API_ENDPOINT_PIN_DETAILS } from "@/lib/constants";
import { Server } from "http";

const PIN_ID_OK = "123456789012345";
const PIN_ID_400 = "400400400400400";

const configureAPIResponses = (mockAPIApp: Express) => {
  mockAPIApp.get(`/api/pins/${PIN_ID_OK}/`, (_, response: Response) => {
    response.json(MOCK_API_RESPONSES_JSON[API_ENDPOINT_PIN_DETAILS]);
  });

  mockAPIApp.get(`/api/pins/${PIN_ID_400}/`, (_, response: Response) => {
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

test("should display pin details in case of successful response from the API", async ({
  page,
}) => {
  await page.goto(`/pin/${PIN_ID_OK}`);

  await page.waitForSelector(`text=${en.HeaderUnauthenticated.LOG_IN}`);

  await page.waitForSelector(
    `img[src="${MOCK_API_RESPONSES_JSON[API_ENDPOINT_PIN_DETAILS].image_url}"]`,
  );

  await page.waitForSelector('text="Pin title"');
  await page.waitForSelector('text="Pin description."');

  await page.waitForSelector('text="John Doe"');
  await page.waitForSelector('img[alt="Pin title"]');
});

test("should display 'pin not found' error in case of 404 response from the API", async ({
  page,
}) => {
  await page.goto("/pin/404404404404404");

  await page.waitForSelector(`text=${en.PinDetails.ERROR_PIN_NOT_FOUND}`);
});

test("should display generic error in case of 400 response from the API", async ({
  page,
}) => {
  await page.goto(`/pin/${PIN_ID_400}`);

  await page.waitForSelector(`text=${en.PinDetails.ERROR_FETCH_PIN_DETAILS}`);
});
