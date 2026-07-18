import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, TouchableOpacity, Text } from "react-native";

import styles from "./ProfileScreen.styles";

import LoadingOverlay from "@/src/components/LoadingOverlay/LoadingOverlay";
import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/src/lib/constants";

const clearTokensData = async () => {
  await Promise.all([
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_STORAGE_KEY),
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY),
    await AsyncStorage.removeItem(ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY),
  ]);
};

const ProfileScreen = () => {
  const { t } = useTranslation();

  const { dispatch } = useAuthenticationContext();

  const [isClearingTokensData, setIsClearingTokensData] = useState(false);

  const handleLogOut = async () => {
    setIsClearingTokensData(true);

    try {
      await clearTokensData();
    } catch {
      // Fail silently:
      setIsClearingTokensData(false);
      return;
    }

    dispatch({ type: "LOGGED_OUT" });

    setIsClearingTokensData(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleLogOut}
        style={styles.logOutButton}
        testID="log-out-button"
      >
        <Text style={styles.logOutButtonText}>
          {t("ProfileScreen.LOG_OUT")}
        </Text>
      </TouchableOpacity>
      {isClearingTokensData && <LoadingOverlay />}
    </View>
  );
};

export default ProfileScreen;
