import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import {
  ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  API_ENDPOINT_REFRESH_TOKEN,
  PROFILE_PICTURE_URL_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/src/lib/constants";
import { throwIfKO } from "@/src/lib/utils/fetch";

export const TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS = 60 * 60 * 1000; // i.e. 1 hour

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

  throwIfKO(response);

  const responseData = await response.json();

  return {
    accessToken: responseData.access_token,
    accessTokenExpirationDate: responseData.access_token_expiration_utc,
  };
};
