import { by, element } from "detox";

import {
  launchSignedOut,
  logInAndWaitForBoard,
  tap,
  typeInto,
  waitForNthVisible,
  waitForText,
} from "./helpers";

// Must match SEARCH_SEED_TERM and NUMBER_OF_SEARCH_PINS in
// backend/pinit_api/management/commands/seed_database_e2e.py
const SEARCH_TERM = "playwrightuniquesearch";
const NUMBER_OF_SEARCH_PINS = 3;

// A term that cannot match any seeded pin.
const NO_RESULTS_TERM = "00000000-0000-0000-0000-000000000000";

const searchFor = async (term: string) => {
  await tap("tab-bar-button-search");
  await tap("pins-search-input-text-input");
  await typeInto("pins-search-input-text-input", term);
  await element(by.id("pins-search-input-text-input")).tapReturnKey();
};

describe("Search", () => {
  beforeEach(async () => {
    await launchSignedOut();
    await logInAndWaitForBoard();
  });

  it("shows results for a matching query", async () => {
    await searchFor(SEARCH_TERM);

    // The seed creates NUMBER_OF_SEARCH_PINS matching pins, so this asserts that
    // every one of them rendered. There is no upper bound to assert: the Home
    // tab stays mounted behind the Search tab and its thumbnails carry the same
    // testID, so counting by existence would count those too.
    await waitForNthVisible(
      "pin-thumbnail-pin-image",
      NUMBER_OF_SEARCH_PINS - 1,
    );
  });

  it("shows a message when the query matches nothing", async () => {
    await searchFor(NO_RESULTS_TERM);

    // SearchScreen.NO_RESULTS in translations/en.json
    await waitForText("No pin matches your search. Try another search term!");
  });
});
