import { BrowserContext } from "@playwright/test";

export const BACKEND_API_URL = "http://127.0.0.1:8000/api";

export const E2E_TEST_USER_EMAIL = "e2e_test@example.com";
export const E2E_TEST_USER_PASSWORD = "testpassword123";

// Obtains a real refresh token for the E2E test user via the backend API,
// then injects it as an httpOnly cookie into the browser context.
// On next page load the frontend's AccessTokenRefresher will exchange it
// for a fresh access token, putting the browser in an authenticated state
// without going through the login UI.
export const loginAsTestUser = async ({
  context,
}: {
  context: BrowserContext;
}): Promise<void> => {
  const response = await fetch(`${BACKEND_API_URL}/token/web/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: E2E_TEST_USER_EMAIL,
      password: E2E_TEST_USER_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login request failed with status ${response.status}`);
  }

  const setCookieHeader = response.headers.get("set-cookie");
  if (!setCookieHeader) {
    throw new Error("No set-cookie header in login response");
  }

  const match = setCookieHeader.match(/refreshToken=([^;]+)/);
  if (!match) {
    throw new Error("refreshToken value not found in set-cookie header");
  }

  await context.addCookies([
    {
      name: "refreshToken",
      value: match[1],
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      secure: false,
    },
  ]);
};
