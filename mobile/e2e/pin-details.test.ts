import {
  launchSignedOut,
  logInAndWaitForBoard,
  scrollUntilVisible,
  tap,
  tapUntilVisible,
  waitForText,
  waitForVisible,
} from "./helpers";

// The seed gives this pin a fixed ID, title, description and author, so the flow
// opens one known pin instead of whatever the board shows first. The web suite
// uses the same ID in routes/pin-id.spec.ts. See seed_database_e2e.py
const SEEDED_PIN_ID = "e2e70001-0000-4000-8000-000000000001";
const SEEDED_PIN_TITLE = "Pin title";
const SEEDED_PIN_DESCRIPTION = "Pin description.";
const SEEDED_PIN_AUTHOR = "John Doe";

const seededPinThumbnail = `pin-thumbnail-${SEEDED_PIN_ID}`;

describe("Pin details", () => {
  beforeEach(async () => {
    await launchSignedOut();
    await logInAndWaitForBoard();
  });

  it("opens a known pin from the home board and goes back", async () => {
    await scrollUntilVisible(seededPinThumbnail, "pins-board-scroll-view");
    await tapUntilVisible(seededPinThumbnail, "pin-details-pin-image");

    await waitForText(SEEDED_PIN_TITLE);
    await waitForText(SEEDED_PIN_DESCRIPTION);
    await waitForText(SEEDED_PIN_AUTHOR);

    await tap("pin-details-view-back-button");

    await waitForVisible("pins-board-scroll-view");
  });

  it("opens the author screen from a pin", async () => {
    await scrollUntilVisible(seededPinThumbnail, "pins-board-scroll-view");
    await tapUntilVisible(seededPinThumbnail, "pin-details-author-data");

    await tap("pin-details-author-data");

    // AuthorScreen renders AccountDetailsView, whose back button is the one
    // anchor that does not depend on the account having pictures or pins.
    await waitForVisible("account-details-view-back-button");
    await waitForText(SEEDED_PIN_AUTHOR);
  });
});
