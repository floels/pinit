import { execFileSync } from "child_process";
import { by, device, element, waitFor } from "detox";

// Same fixture user as the web suite. See
// backend/pinit_api/management/commands/seed_database_e2e.py
export const E2E_TEST_USER_EMAIL = "e2e_test@example.com";
export const E2E_TEST_USER_PASSWORD = "testpassword123";

const DEFAULT_TIMEOUT_MS = 15_000;

// Long enough that a slow-but-successful tap does not trigger a needless retry.
const TAP_RETRY_TIMEOUT_MS = 6_000;
// A short settle between retries, so the next attempt sees a stable layout.
const RETRY_PAUSE_MS = 500;

export const waitForVisible = async (
  testID: string,
  timeout = DEFAULT_TIMEOUT_MS,
) => {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
};

export const waitForText = async (
  text: string,
  timeout = DEFAULT_TIMEOUT_MS,
) => {
  await waitFor(element(by.text(text)))
    .toBeVisible()
    .withTimeout(timeout);
};

// A pins board renders one element per pin, all with the same testID. Detox
// refuses an ambiguous match, so a flow that works on a list picks an index.
export const waitForNthVisible = async (
  testID: string,
  index: number,
  timeout = DEFAULT_TIMEOUT_MS,
) => {
  await waitFor(element(by.id(testID)).atIndex(index))
    .toBeVisible()
    .withTimeout(timeout);
};

// Detox synchronization is off (see `launchSignedOut`), so a tap must wait for
// its target. Every flow taps through this helper.
export const tap = async (testID: string) => {
  await waitForVisible(testID);
  await element(by.id(testID)).tap();
};

export const tapNth = async (testID: string, index: number) => {
  await waitForNthVisible(testID, index);
  await element(by.id(testID)).atIndex(index).tap();
};

// Taps a target that is still moving, and confirms the effect.
//
// Synchronization is off, so Detox works on a view that can still animate into
// place or re-layout. Two failures follow from that:
//
// - The tap lands before the press handler is ready, as the create modal slides
//   in, and the press is lost.
// - The tap misses, because the view moved between the hit-test and the touch.
//   Detox then reports "View is not hittable at its visible point".
//
// Both cases recover from a retry. The expected element states what the tap is
// supposed to achieve, which reads better than an arbitrary pause.
const tapWithRetry = async (
  performTap: () => Promise<void>,
  expectedTestID: string,
  attempts: number,
) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await performTap();
      // `atIndex(0)` asks for at least one match, not exactly one. A tap that
      // lands on a list gets several, and a bare `by.id` would then stay
      // ambiguous until it times out, which reads like the tap did nothing.
      await waitForNthVisible(expectedTestID, 0, TAP_RETRY_TIMEOUT_MS);
      return;
    } catch (error) {
      if (attempt === attempts) {
        throw error;
      }
      // Give the layout a moment before the next attempt.
      await new Promise((resolve) => setTimeout(resolve, RETRY_PAUSE_MS));
    }
  }
};

export const tapUntilVisible = async (
  testID: string,
  expectedTestID: string,
  attempts = 3,
) => {
  await tapWithRetry(() => tap(testID), expectedTestID, attempts);
};

export const tapText = async (text: string) => {
  await waitForText(text);
  await element(by.text(text)).tap();
};

// Same retry as `tapUntilVisible`, for a target that carries no testID. A search
// suggestion is one: the list renders every item with the same testID, so the
// text is what tells them apart.
export const tapTextUntilVisible = async (
  text: string,
  expectedTestID: string,
  attempts = 3,
) => {
  await tapWithRetry(() => tapText(text), expectedTestID, attempts);
};

export const typeInto = async (testID: string, text: string) => {
  await waitForVisible(testID);
  await element(by.id(testID)).typeText(text);
};

// Starts the app from a known signed-out state.
//
// Two reasons for the launch arguments and the keychain reset:
//
// 1. `detoxEnableSynchronization: 0` turns off the Detox idle synchronization.
//    The app animates without end: `Spinner` uses `Animated.loop`, and the
//    landing gallery scrolls for two minutes. Detox waits for animations to
//    finish, so it would never consider the app idle, and every command would
//    time out. The flows below therefore wait on explicit conditions, the same
//    way the Playwright suite does.
// 2. `delete` wipes the app data, but `expo-secure-store` writes to the iOS
//    keychain, which survives the wipe. Without the reset, the app restores the
//    previous session and starts on the authenticated tab bar.
export const launchSignedOut = async ({
  permissions,
}: { permissions?: Record<string, string> } = {}) => {
  execFileSync("xcrun", ["simctl", "keychain", device.id, "reset"]);

  await device.launchApp({
    newInstance: true,
    delete: true,
    launchArgs: { detoxEnableSynchronization: 0 },
    ...(permissions ? { permissions } : {}),
  });
};

// Relaunches without clearing anything, so the app has to restore its session
// from `expo-secure-store` and refresh the access token at start-up. Use this to
// assert what survives a restart. `launchSignedOut` is the opposite.
export const relaunchKeepingSession = async () => {
  await device.launchApp({
    newInstance: true,
    launchArgs: { detoxEnableSynchronization: 0 },
  });
};

// Adds an image to the simulator photo library. The library belongs to the
// device, not to the app, so a single call covers every launch that follows.
export const addPhotoToSimulator = (imagePath: string) => {
  execFileSync("xcrun", ["simctl", "addmedia", device.id, imagePath]);
};

export const logIn = async ({
  email = E2E_TEST_USER_EMAIL,
  password = E2E_TEST_USER_PASSWORD,
}: { email?: string; password?: string } = {}) => {
  await tap("log-in-button");
  await waitForVisible("login-screen-email-input");

  await typeInto("login-screen-email-input", email);
  await typeInto("login-screen-password-input", password);
  await tap("login-screen-submit-button");
};

// Most flows start on the authenticated home board, so they share this step.
export const logInAndWaitForBoard = async () => {
  await logIn();
  await waitForVisible("pins-board-scroll-view");
};

// For a flow that needs a signed-out app but does not test the log-out UI
// itself. `authentication.test.ts` spells these taps out, because there the
// steps are the subject of the test.
export const logOut = async () => {
  await tap("tab-bar-button-profile");
  await tap("log-out-button");
  await waitForVisible("log-in-button");
};
