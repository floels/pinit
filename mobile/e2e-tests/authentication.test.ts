import { launchSignedOut, logIn, tap, waitForVisible } from "./helpers";

describe("Authentication", () => {
  beforeEach(async () => {
    await launchSignedOut();
  });

  it("shows the landing screen and logs the user in", async () => {
    await waitForVisible("log-in-button");

    await logIn();

    await waitForVisible("pins-board-scroll-view");
  });

  it("logs the user out", async () => {
    await logIn();
    await waitForVisible("pins-board-scroll-view");

    await tap("tab-bar-button-profile");
    await tap("log-out-button");

    await waitForVisible("log-in-button");
  });
});
