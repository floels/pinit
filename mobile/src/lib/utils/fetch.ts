import * as SecureStore from "expo-secure-store";

import { ACCESS_TOKEN_STORAGE_KEY } from "@/src/lib/constants";
import {
  MissingAccessTokenError,
  ResponseKOError,
} from "@/src/lib/customErrors";

export const fetchWithAuthentication = async (
  endpoint: string,
  fetchOptions?: RequestInit,
) => {
  const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);

  if (!accessToken) {
    throw new MissingAccessTokenError();
  }

  return fetch(endpoint, {
    ...fetchOptions,
    headers: {
      ...fetchOptions?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const throwIfKO = (response: Response) => {
  if (!response.ok) {
    throw new ResponseKOError();
  }
};
