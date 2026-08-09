import * as SecureStore from "expo-secure-store";

import { fetchPublic } from "./fetchers";

import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/src/lib/constants";
import { MissingAccessTokenError } from "@/src/lib/customErrors";
import {
  clearStoredAuthData,
  refreshAccessToken,
} from "@/src/lib/utils/authentication";

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

// The single entry point for API traffic from a component or a hook. It returns
// two named methods, so every call site states whether it needs the access
// token. `fetchPublic` is re-exported unchanged from './fetchers': it needs no
// auth state, and it is passed through here only so that a call site has one
// import to reach for. Mirrors 'useAPI' on web.
export const useAPI = () => {
  const { dispatch } = useAuthenticationContext();

  const fetchAuthenticated = async (
    endpoint: string,
    fetchOptions?: RequestInit,
  ) => {
    const accessToken = await SecureStore.getItemAsync(
      ACCESS_TOKEN_STORAGE_KEY,
    );

    if (!accessToken) {
      throw new MissingAccessTokenError();
    }

    const response = await fetchWithAccessToken(
      endpoint,
      fetchOptions,
      accessToken,
    );

    if (response.status !== 401) {
      return response;
    }

    // The access token may be rejected even though our local expiration date
    // said otherwise (e.g. clock skew, or a token invalidated server-side). So
    // we refresh once and retry. 'refreshAccessToken' is single-flight, so
    // concurrent 401s share one refresh rather than spending the rotating
    // refresh token twice.
    const didRefresh = await refreshAccessToken();

    const refreshedAccessToken = didRefresh
      ? await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY)
      : null;

    // The session cannot be renewed, so it is over. Clearing the tokens and
    // dispatching switches the app to the unauthenticated tree, which is why no
    // screen carries logout logic of its own.
    if (!refreshedAccessToken) {
      await clearStoredAuthData();
      dispatch({ type: "GOT_401_RESPONSE" });

      return response;
    }

    return fetchWithAccessToken(endpoint, fetchOptions, refreshedAccessToken);
  };

  return { fetchAuthenticated, fetchPublic };
};
