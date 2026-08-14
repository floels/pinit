import {
  launchSignedOut,
  logInAndWaitForBoard,
  tap,
  tapNth,
  tapTextUntilVisible,
  typeInto,
  waitForText,
  waitForVisible,
} from "./helpers";

// The seeded pins are titled "Sample pin N playwrightuniquesearch", so
// Elasticsearch can complete this prefix. See SEARCH_SEED_TERM in
// backend/pinit_api/management/commands/seed_database_e2e.py
const SUGGESTION_PREFIX = "playwrightunique";
const EXPECTED_SUGGESTION = "playwrightuniquesearch";

// The seeded search pins are all authored by johndoe_account. See
// seed_database_e2e.py.
const SEARCH_PINS_AUTHOR = "John Doe";

describe("Search suggestions", () => {
  beforeEach(async () => {
    await launchSignedOut();
    await logInAndWaitForBoard();
  });

  it("suggests an indexed term, then searches for it and opens a result", async () => {
    await tap("tab-bar-button-search");
    await tap("pins-search-input-text-input");
    await typeInto("pins-search-input-text-input", SUGGESTION_PREFIX);

    // The suggestions come from an Elasticsearch aggregation over the indexed
    // pins. The list also echoes the typed prefix, so asserting on the fuller
    // word proves that the backend returned it.
    await waitForText(EXPECTED_SUGGESTION);

    await tapTextUntilVisible(EXPECTED_SUGGESTION, "pin-thumbnail-pin-image");

    await tapNth("pin-thumbnail-pin-image", 0);

    await waitForVisible("pin-details-pin-image");
    await waitForText(SEARCH_PINS_AUTHOR);
  });
});
