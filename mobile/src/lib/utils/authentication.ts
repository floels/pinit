import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Dispatch } from "react";

import { fetchPublic } from "@/src/lib/api/fetchers";
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
import { queryClient } from "@/src/lib/queryClient";

type SessionEndReason = "user" | "expired";

type SessionEndedDispatch = Dispatch<{
  type: "SESSION_ENDED";
  reason?: SessionEndReason;
}>;

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

// Removes every piece of persisted session data (tokens, expiry, and the
// profile-picture cold-start URL). Used by `endSession` and by the launch gate
// when no usable session exists yet (SESSION_ABSENT). Clearing storage alone
// is not enough to leave an authenticated Session — that goes through
// `endSession`.
export const clearStoredAuthData = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY),
    AsyncStorage.removeItem(ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY),
    AsyncStorage.removeItem(PROFILE_PICTURE_URL_STORAGE_KEY),
  ]);
};

// Single composed path for ending an authenticated Session. Clears persisted
// auth data, wipes the in-memory React Query cache, and dispatches
// SESSION_ENDED so NavigationContainer switches to the login tree.
export const endSession = async ({
  reason,
  dispatch,
}: {
  reason: SessionEndReason;
  dispatch: SessionEndedDispatch;
}) => {
  await clearStoredAuthData();
  queryClient.clear();
  dispatch({ type: "SESSION_ENDED", reason });
};

// User-initiated sign-out: best-effort server revoke of the refresh token,
// then `endSession({ reason: 'user' })`. Revocation never blocks teardown —
// if the request fails (offline, already-expired token), we still end the
// Session locally. Matches web logout's server-side revocation intent.
export const signOut = async (dispatch: SessionEndedDispatch) => {
  try {
    const refreshToken = await SecureStore.getItemAsync(
      REFRESH_TOKEN_STORAGE_KEY,
    );

    if (refreshToken) {
      await fetchPublic(`${API_BASE_URL}/${API_ENDPOINT_LOGOUT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } catch {
    // Best-effort: never block sign-out on server-side revocation.
  }

  await endSession({ reason: "user", dispatch });
};

// After a 401 whose refresh failed: the Session cannot be renewed.
export const onUnrecoverableAuthFailure = async (
  dispatch: SessionEndedDispatch,
) => {
  await endSession({ reason: "expired", dispatch });
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
  const response = await fetchPublic(
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
