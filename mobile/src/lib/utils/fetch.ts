import * as SecureStore from "expo-secure-store";

import { ACCESS_TOKEN_STORAGE_KEY } from "@/src/lib/constants";
import {
  MissingAccessTokenError,
  ResponseKOError,
} from "@/src/lib/customErrors";
import { refreshAccessToken } from "@/src/lib/utils/authentication";

const fetchWithAccessToken = (
  endpoint: string,
  fetchOptions: RequestInit | undefined,
  accessToken: string,
) =>
  fetch(endpoint, {
    ...fetchOptions,
    headers: {
      ...fetchOptions?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

export const fetchWithAuthentication = async (
  endpoint: string,
  fetchOptions?: RequestInit,
) => {
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);

  if (!accessToken) {
    throw new MissingAccessTokenError();
  }

  const response = await fetchWithAccessToken(
    endpoint,
    fetchOptions,
    accessToken,
  );

  // The access token may be rejected even though our local expiration date said
  // otherwise (e.g. clock skew, or a token invalidated server-side). On a 401,
  // transparently refresh the access token once and retry the request. We only
  // surface the 401 to the caller (which logs the user out) when the refresh
  // itself fails, i.e. the session is genuinely dead.
  if (response.status !== 401) {
    return response;
  }

  const didRefresh = await refreshAccessToken();

  if (!didRefresh) {
    return response;
  }

  const refreshedAccessToken = await SecureStore.getItemAsync(
    ACCESS_TOKEN_STORAGE_KEY,
  );

  if (!refreshedAccessToken) {
    return response;
  }

  return fetchWithAccessToken(endpoint, fetchOptions, refreshedAccessToken);
};

export const throwIfKO = (response: Response) => {
  if (!response.ok) {
    throw new ResponseKOError();
  }
};
