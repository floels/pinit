import {
  launchSignedOut,
  logInAndWaitForBoard,
  tap,
  tapNth,
  waitForVisible,
} from "./helpers";

describe("Pin details", () => {
  beforeEach(async () => {
    await launchSignedOut();
    await logInAndWaitForBoard();
  });

  it("opens a pin from the home board and goes back", async () => {
    await tapNth("pin-thumbnail-pin-image", 0);

    await waitForVisible("pin-details-pin-image");
    await waitForVisible("pin-details-author-data");

    await tap("pin-details-view-back-button");

    await waitForVisible("pins-board-scroll-view");
  });

  it("opens the author screen from a pin", async () => {
    await tapNth("pin-thumbnail-pin-image", 0);
    await waitForVisible("pin-details-author-data");

    await tap("pin-details-author-data");

    // AuthorScreen renders AccountDetailsView, whose back button is the one
    // anchor that does not depend on the account having pictures or pins.
    await waitForVisible("account-details-view-back-button");
  });
});
