import {
  launchSignedOut,
  logInAndWaitForBoard,
  logOut,
  relaunchKeepingSession,
  waitForVisible,
} from "./helpers";

// The web suite covers the same ground with "session persists across page
// refreshes". On mobile the session lives in `expo-secure-store`, and a start-up
// gate exchanges the refresh token for an access token before the authenticated
// tree renders. See TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS in
// src/lib/utils/authentication.ts.
describe("Session persistence", () => {
  it("keeps the user signed in across a relaunch", async () => {
    await launchSignedOut();
    await logInAndWaitForBoard();

    await relaunchKeepingSession();

    // No login step here. The board proves that the app restored the session
    // and obtained a usable access token on its own.
    await waitForVisible("pins-board-scroll-view");
  });

  it("stays signed out across a relaunch after a log out", async () => {
    await launchSignedOut();
    await logInAndWaitForBoard();

    await logOut();

    await relaunchKeepingSession();

    // A stale token left in the keychain would bounce the user back into the
    // authenticated tree, so this asserts that logging out cleared it.
    await waitForVisible("log-in-button");
  });
});
