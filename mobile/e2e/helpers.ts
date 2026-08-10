import { execFileSync } from "child_process";
import { by, device, element, waitFor } from "detox";

// Same fixture user as the web suite. See
// backend/pinit_api/management/commands/seed_database_e2e.py
export const E2E_TEST_USER_EMAIL = "e2e_test@example.com";
export const E2E_TEST_USER_PASSWORD = "testpassword123";

const DEFAULT_TIMEOUT_MS = 15_000;

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

// Detox synchronization is off (see `launchSignedOut`), so a tap must wait for
// its target. Every flow taps through this helper.
export const tap = async (testID: string) => {
  await waitForVisible(testID);
  await element(by.id(testID)).tap();
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
export const launchSignedOut = async () => {
  execFileSync("xcrun", ["simctl", "keychain", device.id, "reset"]);

  await device.launchApp({
    newInstance: true,
    delete: true,
    launchArgs: { detoxEnableSynchronization: 0 },
  });
};

export const logIn = async ({
  email = E2E_TEST_USER_EMAIL,
  password = E2E_TEST_USER_PASSWORD,
}: { email?: string; password?: string } = {}) => {
  await tap("log-in-button");
  await waitForVisible("login-screen-email-input");

  await element(by.id("login-screen-email-input")).typeText(email);
  await element(by.id("login-screen-password-input")).typeText(password);
  await tap("login-screen-submit-button");
};
