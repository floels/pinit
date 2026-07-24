import { API_URL_REFRESH_TOKEN } from "@/lib/constants";

// Shared query key + fetcher for the access-token refresh, used by both the
// startup refresh (AuthContextProvider) and the reactive on-401 refresh
// (useFetchWithAuth). Sharing the key lets TanStack Query dedupe concurrent
// refreshes into a single in-flight request, so the rotating refresh token
// cannot race and revoke itself.
export const REFRESH_ACCESS_TOKEN_QUERY_KEY = ["refreshAccessToken"];

export type RefreshedAccessTokenData = { access_token: string };

// Resolves to the refreshed token payload, or null when the refresh fails
// (e.g. no/expired refresh cookie → 401).
export const fetchRefreshedAccessToken =
  async (): Promise<RefreshedAccessTokenData | null> => {
    const response = await fetch(API_URL_REFRESH_TOKEN, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  };
