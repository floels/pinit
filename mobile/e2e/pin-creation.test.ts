import { by, element, expect } from "detox";
import path from "path";

import {
  addPhotoToSimulator,
  launchSignedOut,
  logInAndWaitForBoard,
  tap,
  tapUntilVisible,
  typeInto,
  waitForText,
} from "./helpers";

const PIN_TITLE = "E2E created pin";
const PIN_DESCRIPTION = "Created by the Detox suite.";

describe("Pin creation", () => {
  beforeAll(() => {
    // The photo library belongs to the simulator, so one call covers every
    // launch below. Without a photo, the camera roll grid stays empty.
    addPhotoToSimulator(path.resolve(__dirname, "fixtures/pin-image.png"));
  });

  beforeEach(async () => {
    // expo-media-library needs the photo permission. Detox grants it at launch,
    // which also avoids the system dialog.
    await launchSignedOut({ permissions: { photos: "YES" } });
    await logInAndWaitForBoard();
  });

  const createPinFromLibrary = async () => {
    await tap("tab-bar-button-create");
    await tapUntilVisible("create-pin-button", "camera-roll-image-0");

    // The Next button appears only once a photo is selected, so it doubles as
    // the confirmation that the selection registered.
    await tapUntilVisible(
      "camera-roll-image-0",
      "select-pin-image-screen-next-button",
    );
    await tapUntilVisible(
      "select-pin-image-screen-next-button",
      "pin-title-input",
    );

    await typeInto("pin-title-input", PIN_TITLE);
    await typeInto("pin-description-input", PIN_DESCRIPTION);

    // The submit button sits at the bottom of the screen, so the keyboard hides
    // it. Both inputs are single line, so the return key closes the keyboard.
    await element(by.id("pin-description-input")).tapReturnKey();

    await tap("create-pin-submit-button");
  };

  it("creates a pin from a photo in the library", async () => {
    await createPinFromLibrary();

    // CreatePin.CREATION_SUCCESS_MESSAGE in translations/en.json
    await waitForText("Your Pin is published!");
  });

  it("opens the created pin from the success toast", async () => {
    await createPinFromLibrary();

    await waitForText("Your Pin is published!");

    // The toast hides itself after a few seconds, so this taps without delay.
    // The View action needs the account context, because the create response
    // carries no author. See BrowseMainNavigatorContainer.
    await tapUntilVisible(
      "pin-creation-success-toast-view-button",
      "pin-details-pin-image",
    );

    await waitForText(PIN_TITLE);
  });

  it("keeps the next button hidden until an image is selected", async () => {
    await tap("tab-bar-button-create");
    await tapUntilVisible("create-pin-button", "camera-roll-image-0");

    // The screen renders the button only once a selection exists, so the
    // element is absent rather than hidden.
    await expect(
      element(by.id("select-pin-image-screen-next-button")),
    ).not.toExist();
  });
});
