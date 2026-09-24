import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, TouchableOpacity, Text } from "react-native";

import styles from "./ProfileScreen.styles";

import LoadingOverlay from "@/src/components/LoadingOverlay/LoadingOverlay";
import { useLogoutMutation } from "@/src/hooks/useLogoutMutation";

const ProfileScreen = () => {
  const { t } = useTranslation();

  const [isClearingTokensData, setIsClearingTokensData] = useState(false);

  const { mutateAsync } = useLogoutMutation();

  const handleLogOut = async () => {
    setIsClearingTokensData(true);

    try {
      await mutateAsync();
    } catch {
      // Fail silently:
      setIsClearingTokensData(false);
      return;
    }

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
