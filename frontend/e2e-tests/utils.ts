import express, { Express } from "express";
import { Server } from "http";
import cors from "cors";
import { BrowserContext } from "@playwright/test";
import {
  ACCESS_TOKEN_COOKIE_KEY,
  REFRESH_TOKEN_COOKIE_KEY,
} from "@/lib/constants";

export const PORT_MOCK_API_SERVER = 8000;

export const getExpressApp = () => {
  const expressApp = express();

  expressApp.use(cors());
  expressApp.use(express.json());

  return expressApp;
};

export const launchMockAPIServer = (
  configureAPIResponses: (mockAPIApp: Express) => void,
) => {
  return new Promise<Server>((resolve) => {
    const mockAPIApp = getExpressApp();

    configureAPIResponses(mockAPIApp);

    const mockAPIServer = mockAPIApp.listen(PORT_MOCK_API_SERVER, () => {
      resolve(mockAPIServer);
    });
  });
};

export const addAccessTokenTookie = ({
  context,
}: {
  context: BrowserContext;
}) => {
  context.addCookies([
    {
      name: ACCESS_TOKEN_COOKIE_KEY,
      value: "dummy_access_token",
      path: "/",
      domain: "127.0.0.1",
      httpOnly: true,
      secure: true,
    },
  ]);
};

export const addRefreshTokenTookie = ({
  context,
}: {
  context: BrowserContext;
}) => {
  context.addCookies([
    {
      name: REFRESH_TOKEN_COOKIE_KEY,
      value: "dummy_refresh_token",
      path: "/",
      domain: "127.0.0.1",
      httpOnly: true,
      secure: true,
    },
  ]);
};
