import { API_URL_REFRESH_TOKEN } from "@/lib/constants";
import { fetchWithRefreshCookie } from "./fetchers";

export type RefreshedAccessTokenData = { access_token: string };

// Tracks an in-flight refresh so concurrent callers share it (see below).
let refreshInFlight: Promise<RefreshedAccessTokenData | null> | null = null;

// Exchanges the refresh cookie for a new access token. Resolves to the token
// payload, or to null when the refresh fails (no cookie, an expired or a revoked
// token, an unreachable backend). It never rejects: a null reads as "the session
// is over" at every call site.
//
// Single-flight: if a refresh is already running, concurrent callers await that
// same request rather than each firing their own. Because refresh tokens rotate
// (each refresh revokes the presented one), parallel refreshes would present
// the same cookie twice. The backend would accept the first and reject the
// rest, and the user would land on the login modal. Two callers rely on this:
// the startup refresh in the auth context, and the on-401 refresh in 'useAPI'.
export const refreshAccessToken = () => {
  refreshInFlight ??= doRefreshAccessToken().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

const doRefreshAccessToken =
  async (): Promise<RefreshedAccessTokenData | null> => {
    try {
      const response = await fetchWithRefreshCookie(API_URL_REFRESH_TOKEN, {
        method: "POST",
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  };
