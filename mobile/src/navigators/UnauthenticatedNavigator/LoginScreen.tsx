import { useTranslation } from "react-i18next";
import { Text, View, TouchableOpacity, TextInput } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./LoginScreen.styles";

import LoadingOverlay from "@/src/components/LoadingOverlay/LoadingOverlay";

type LoginScreenProps = {
  email: string;
  onChangeEmail: (email: string) => void;
  password: string;
  onChangePassword: (password: string) => void;
  isPasswordVisible: boolean;
  canSubmit: boolean;
  isSubmitting: boolean;
  submitError: string;
  onTogglePasswordVisibility: () => void;
  onSubmit: () => void;
  onPressClose: () => void;
};

const LoginScreen = ({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  isPasswordVisible,
  canSubmit,
  isSubmitting,
  submitError,
  onTogglePasswordVisibility,
  onSubmit,
  onPressClose,
}: LoginScreenProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.closeIconAndHeader}>
        <TouchableOpacity
          onPress={onPressClose}
          style={styles.closeIcon}
          testID="login-screen-close-icon"
        >
          <FontAwesome5Icon name="times" size={24} />
        </TouchableOpacity>
        <Text style={styles.header}>{t("LandingScreen.LOG_IN")}</Text>
      </View>
      <View style={styles.loginForm}>
        <View style={styles.emailLabelAndInput}>
          <Text>{t("LandingScreen.LABEL_EMAIL")}</Text>
          <TextInput
            value={email}
            onChangeText={onChangeEmail}
            placeholder={t("LandingScreen.PLACEHOLDER_EMAIL")}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.emailInput}
          />
        </View>
        <View style={styles.passwordLabelAndInput}>
          <Text>{t("LandingScreen.LABEL_PASSWORD")}</Text>
          <View style={styles.passwordInputAndVisibilityIcon}>
            <TextInput
              value={password}
              onChangeText={onChangePassword}
              placeholder={t("LandingScreen.PLACEHOLDER_PASSWORD")}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={onTogglePasswordVisibility}
              testID="login-screen-toggle-password-visibility-icon"
            >
              <FontAwesome5Icon
                name="eye"
                size={24}
                style={styles.togglePasswordVisibilityIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        {submitError && (
          <View style={styles.submitError}>
            <FontAwesome5Icon
              name="exclamation-circle"
              style={styles.submitErrorIcon}
              size={20}
            />
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        )}
        <TouchableOpacity
          disabled={!canSubmit}
          onPress={onSubmit}
          style={[
            styles.submitButton,
            canSubmit
              ? styles.submitButtonEnabled
              : styles.submitButtonDisabled,
          ]}
          testID="login-screen-submit-button"
        >
          <Text
            style={[
              styles.submitButtonText,
              canSubmit
                ? styles.submitButtonTextEnabled
                : styles.submitButtonTextDisabled,
            ]}
          >
            {t("LandingScreen.LOG_IN")}
          </Text>
        </TouchableOpacity>
      </View>
      {isSubmitting && <LoadingOverlay />}
    </View>
  );
};

export default LoginScreen;
