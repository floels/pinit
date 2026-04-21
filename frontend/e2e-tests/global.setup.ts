// See https://playwright.dev/docs/test-global-setup-teardown#setup-example
import { test as setup, expect } from "@playwright/test";
import { check } from "tcp-port-used";
import { PORT_MOCK_API_SERVER } from "./utils";

setup("API server port is free", async () => {
  const isPortInUse = await check(PORT_MOCK_API_SERVER);

  expect(isPortInUse).toEqual(false);
});
