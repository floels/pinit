import {
  launchSignedOut,
  logInAndWaitForBoard,
  tap,
  tapTextUntilVisible,
  typeInto,
  waitForText,
} from "./helpers";

// The seeded pins are titled "Sample pin N playwrightuniquesearch", so
// Elasticsearch can complete this prefix. See SEARCH_SEED_TERM in
// backend/pinit_api/management/commands/seed_database_e2e.py
const SUGGESTION_PREFIX = "playwrightunique";
const EXPECTED_SUGGESTION = "playwrightuniquesearch";

describe("Search suggestions", () => {
  beforeEach(async () => {
    await launchSignedOut();
    await logInAndWaitForBoard();
  });

  it("suggests an indexed term, then searches for it", async () => {
    await tap("tab-bar-button-search");
    await tap("pins-search-input-text-input");
    await typeInto("pins-search-input-text-input", SUGGESTION_PREFIX);

    // The suggestions come from an Elasticsearch aggregation over the indexed
    // pins. The list also echoes the typed prefix, so asserting on the fuller
    // word proves that the backend returned it.
    await waitForText(EXPECTED_SUGGESTION);

    await tapTextUntilVisible(EXPECTED_SUGGESTION, "pin-thumbnail-pin-image");
  });
});
