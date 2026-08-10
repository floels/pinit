import { BrowserContext } from "@playwright/test";

export const BACKEND_API_URL = "http://localhost:8000/api";

export const E2E_TEST_USER_EMAIL = "e2e_test@example.com";
export const E2E_TEST_USER_PASSWORD = "testpassword123";

// Obtains a real refresh token for the E2E test user via the backend API,
// then injects it as an httpOnly cookie into the browser context.
// On the next page load, the startup refresh in the auth context exchanges it
// for a fresh access token, so the browser reaches an authenticated state
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
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
    },
  ]);
};

// Replaces the refresh cookie with a value that the backend rejects, so the next
// refresh fails. A test uses this to end a session without waiting for the real
// 15-minute lifetime of an access token.
export const invalidateRefreshCookie = async ({
  context,
}: {
  context: BrowserContext;
}): Promise<void> => {
  await context.addCookies([
    {
      name: "refreshToken",
      value: "this.refresh.token.is.revoked",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
    },
  ]);
};
