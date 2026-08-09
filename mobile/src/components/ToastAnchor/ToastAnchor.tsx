import FontAwesome5Icon from "@expo/vector-icons/FontAwesome5";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

import styles from "./ToastAnchor.styles";

const ToastAnchor = () => {
  const { t } = useTranslation();

  // See https://github.com/calintamas/react-native-toast-message/blob/main/docs/custom-layouts.md
  const toastConfig = {
    pinCreationError: ({ text1 }: { text1?: string }) => (
      <View style={styles.pinCreationErrorContainer}>
        <FontAwesome5Icon
          name="exclamation-circle"
          size={24}
          style={styles.pinCreationErrorIcon}
        />
        <Text>{text1}</Text>
      </View>
    ),
    pinCreationSuccess: ({
      props,
    }: {
      props: { handlePressView?: () => void };
    }) => {
      const { handlePressView } = props;

      const handlePressViewPin = () => {
        handlePressView?.();
        Toast.hide();
      };

      // The caller omits 'handlePressView' when it cannot build the
      // destination yet. The toast then reports the success on its own.
      const viewButton = handlePressView ? (
        <TouchableOpacity
          onPress={handlePressViewPin}
          style={styles.pinCreationSuccessButton}
          testID="pin-creation-success-toast-view-button"
        >
          <Text style={styles.pinCreationSuccessButtonText}>
            {t("CreatePin.CREATION_SUCCESS_TOAST_VIEW")}
          </Text>
        </TouchableOpacity>
      ) : null;

      return (
        <View style={styles.pinCreationSuccessContainer}>
          <Text style={styles.pinCreationSuccessText}>
            {t("CreatePin.CREATION_SUCCESS_MESSAGE")}
          </Text>
          {viewButton}
        </View>
      );
    },
  };

  return <Toast config={toastConfig} />;
};

export default ToastAnchor;
