import { by, element, expect } from "detox";

import {
  E2E_TEST_USER_EMAIL,
  launchSignedOut,
  logIn,
  tap,
  waitForText,
  waitForVisible,
} from "./helpers";

describe("Authentication", () => {
  beforeEach(async () => {
    await launchSignedOut();
  });

  it("shows the landing screen and logs the user in", async () => {
    await waitForVisible("log-in-button");

    await logIn();

    await waitForVisible("pins-board-scroll-view");
  });

  it("shows an error for a wrong password", async () => {
    await logIn({ email: E2E_TEST_USER_EMAIL, password: "wrongpassword" });

    // LandingScreen.INVALID_PASSWORD_LOGIN in translations/en.json
    await waitForText(
      "The password you entered is incorrect. Please try again.",
    );
    await expect(element(by.id("login-screen-submit-button"))).toBeVisible();
  });

  it("logs the user out", async () => {
    await logIn();
    await waitForVisible("pins-board-scroll-view");

    await tap("tab-bar-button-profile");
    await tap("log-out-button");

    await waitForVisible("log-in-button");
  });
});
