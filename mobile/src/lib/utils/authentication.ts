import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import {
  ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/src/lib/constants";

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
