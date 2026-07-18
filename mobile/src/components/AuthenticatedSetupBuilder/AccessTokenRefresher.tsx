import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

import {
  ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  API_BASE_URL,
  API_ENDPOINT_REFRESH_TOKEN,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/src/lib/constants";
import { persistTokensData } from "@/src/lib/utils/authentication";
import { throwIfKO } from "@/src/lib/utils/fetch";

export const TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS = 60 * 60 * 1000; // i.e. 1 hour

type AccessTokenRefresherProps = {
  handleFinishedFetching: () => void;
};

const AccessTokenRefresher = ({
  handleFinishedFetching,
}: AccessTokenRefresherProps) => {
  const fetchRefreshedAccessTokenAndPersistIfRelevant = async () => {
    const shouldRefreshAccessToken = await checkShouldRefreshAccessToken();

    if (!shouldRefreshAccessToken) {
      handleFinishedFetching();
      return;
    }

    const refreshToken = await SecureStore.getItemAsync(
      REFRESH_TOKEN_STORAGE_KEY,
    );

    if (!refreshToken) {
      handleFinishedFetching();
      return;
    }

    await fetchRefreshedAccessTokenAndPersist({ refreshToken });
  };

  const checkShouldRefreshAccessToken = async () => {
    const accessTokenExpirationDateString = await AsyncStorage.getItem(
      ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
    );

    if (!accessTokenExpirationDateString) {
      return true;
    }

    const accessTokenExpirationDateTime = new Date(
      accessTokenExpirationDateString,
    ).getTime();

    const isInvalidDate = isNaN(accessTokenExpirationDateTime);

    if (isInvalidDate) {
      return true;
    }

    const nowTime = new Date().getTime();

    return (
      nowTime + TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS >
      accessTokenExpirationDateTime
    );
  };

  const fetchRefreshedAccessTokenAndPersist = async ({
    refreshToken,
  }: {
    refreshToken: string;
  }) => {
    let refreshedAccessTokenData;

    try {
      refreshedAccessTokenData = await fetchRefreshedAccessToken({
        refreshToken,
      });
    } catch {
      handleFinishedFetching();
      return;
    }

    await persistTokensData(refreshedAccessTokenData);

    handleFinishedFetching();
  };

  const fetchRefreshedAccessToken = async ({
    refreshToken,
  }: {
    refreshToken: string;
  }) => {
    const url = `${API_BASE_URL}/${API_ENDPOINT_REFRESH_TOKEN}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    throwIfKO(response);

    const responseData = await response.json();

    const {
      access_token: accessToken,
      access_token_expiration_utc: accessTokenExpirationDate,
    } = responseData;

    return { accessToken, accessTokenExpirationDate };
  };

  useEffect(() => {
    fetchRefreshedAccessTokenAndPersistIfRelevant();
  }, []);

  return null;
};

export default AccessTokenRefresher;
