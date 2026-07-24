import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import {
  ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  API_ENDPOINT_LOGOUT,
  API_ENDPOINT_REFRESH_TOKEN,
  PROFILE_PICTURE_URL_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/src/lib/constants";
import { ResponseKOError } from "@/src/lib/customErrors";

// Small buffer so the launch gate proactively refreshes an access token that is
// about to expire, rather than letting the first authenticated request race
// expiry. It must stay well below the access-token lifetime (15 min, see the
// backend's ACCESS_TOKEN_LIFETIME setting); the reactive on-401 refresh in
// `fetch.ts` is the safety net for anything that slips through.
export const TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS = 2 * 60 * 1000; // i.e. 2 minutes

export const persistTokensData = async ({
  accessToken,
  refreshToken,
  accessTokenExpirationDate,
}: {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpirationDate?: string;
}) => {
  if (accessToken) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  }

  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  }
  if (accessTokenExpirationDate) {
    await AsyncStorage.setItem(
      ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
      accessTokenExpirationDate,
    );
  }
};

// Removes every piece of persisted session data. Call this whenever the user
// logs out or the session becomes invalid (e.g. a 401), so a stale token can't
// bounce the user back into (and immediately out of) the authenticated tree.
export const clearStoredAuthData = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY),
    AsyncStorage.removeItem(ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY),
    AsyncStorage.removeItem(PROFILE_PICTURE_URL_STORAGE_KEY),
  ]);
};

// Logs the user out: revokes the refresh token server-side, then clears all
// locally stored session data. Server-side revocation is best-effort — if the
// request fails (offline, already-expired token), we still clear local data so
// logout never gets stuck. This gives mobile the same server-side revocation
// that web logout performs via its httpOnly cookie.
export const logOut = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync(
      REFRESH_TOKEN_STORAGE_KEY,
    );

    if (refreshToken) {
      await fetch(`${API_BASE_URL}/${API_ENDPOINT_LOGOUT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } catch {
    // Best-effort: never block logout on server-side revocation.
  }

  await clearStoredAuthData();
};

// Refreshes the access token when it is missing an expiration date or is within
// the refresh buffer of expiring. Returns `true` when the session is usable
// afterwards (token still fresh, or successfully refreshed) and `false` when it
// could not be refreshed (no refresh token, or the refresh request failed),
// meaning the caller should treat the session as ended.
export const ensureFreshAccessToken = async (): Promise<boolean> => {
  const shouldRefresh = await shouldRefreshAccessToken();

  if (!shouldRefresh) {
    return true;
  }

  return refreshAccessToken();
};

// Tracks an in-flight refresh so concurrent callers share it (see below).
let refreshInFlight: Promise<boolean> | null = null;

// Unconditionally attempts to obtain a new access token from the stored refresh
// token, persisting it on success. Returns `true` when the session is usable
// afterwards and `false` when it could not be refreshed (no refresh token, or
// the refresh request failed), meaning the caller should treat the session as
// ended. Unlike `ensureFreshAccessToken`, this ignores the local expiration
// date — use it when the server has already rejected the access token (401).
//
// Single-flight: if a refresh is already running, concurrent callers await the
// same request rather than each firing their own. Because refresh tokens rotate
// (each refresh revokes the presented one), parallel refreshes would otherwise
// spend the same token twice and revoke one another, ending the session.
export const refreshAccessToken = async (): Promise<boolean> => {
  refreshInFlight ??= doRefreshAccessToken().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

const doRefreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = await SecureStore.getItemAsync(
    REFRESH_TOKEN_STORAGE_KEY,
  );

  if (!refreshToken) {
    return false;
  }

  try {
    const refreshedTokensData = await fetchRefreshedAccessToken({
      refreshToken,
    });

    await persistTokensData(refreshedTokensData);

    return true;
  } catch {
    return false;
  }
};

const shouldRefreshAccessToken = async () => {
  const accessTokenExpirationDateString = await AsyncStorage.getItem(
    ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  );

  if (!accessTokenExpirationDateString) {
    return true;
  }

  const accessTokenExpirationDateTime = new Date(
    accessTokenExpirationDateString,
  ).getTime();

  if (isNaN(accessTokenExpirationDateTime)) {
    return true;
  }

  const nowTime = new Date().getTime();

  return (
    nowTime + TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS >
    accessTokenExpirationDateTime
  );
};

const fetchRefreshedAccessToken = async ({
  refreshToken,
}: {
  refreshToken: string;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/${API_ENDPOINT_REFRESH_TOKEN}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    },
  );

  if (!response.ok) {
    throw new ResponseKOError();
  }

  const responseData = await response.json();

  return {
    accessToken: responseData.access_token,
    // The refresh endpoint rotates the refresh token on every call, so persist
    // the new one — the presented token is now revoked server-side.
    refreshToken: responseData.refresh_token,
    accessTokenExpirationDate: responseData.access_token_expiration_utc,
  };
};
