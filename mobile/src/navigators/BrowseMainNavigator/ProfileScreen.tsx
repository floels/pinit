import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, TouchableOpacity, Text } from "react-native";

import styles from "./ProfileScreen.styles";

import LoadingOverlay from "@/src/components/LoadingOverlay/LoadingOverlay";
import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import { logOut } from "@/src/lib/utils/authentication";

const ProfileScreen = () => {
  const { t } = useTranslation();

  const { dispatch } = useAuthenticationContext();

  const [isClearingTokensData, setIsClearingTokensData] = useState(false);

  const handleLogOut = async () => {
    setIsClearingTokensData(true);

    try {
      await logOut();
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
