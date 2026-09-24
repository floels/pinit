import { NavigationProp } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import LoginScreen from "./LoginScreen";

import { useLoginMutation } from "@/src/hooks/useLoginMutation";
import { ERROR_CODE_INVALID_EMAIL } from "@/src/lib/constants";
import { Response401Error } from "@/src/lib/customErrors";
import { isValidEmail, isValidPassword } from "@/src/lib/utils/validation";
import { UnauthenticatedNavigatorParamList } from "@/src/navigators/UnauthenticatedNavigator/UnauthenticatedNavigator";

type LoginScreenContainerProps = {
  navigation: NavigationProp<UnauthenticatedNavigatorParamList>;
};

type Credentials = {
  email: string;
  password: string;
};

const computeCanSubmit = (values: Credentials) => {
  return isValidEmail(values.email) && isValidPassword(values.password);
};

const LoginScreenContainer = ({ navigation }: LoginScreenContainerProps) => {
  const { t } = useTranslation();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { mutateAsync, isPending } = useLoginMutation();

  const canSubmit = computeCanSubmit(credentials);

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getInputChangeHandler =
    ({ input }: { input: "email" | "password" }) =>
    (newValue: string) => {
      setCredentials((previousCredentials) => ({
        ...previousCredentials,
        [input]: newValue,
      }));
    };

  const handleSubmitError = (error: unknown) => {
    if (error instanceof Response401Error) {
      if (error.message === ERROR_CODE_INVALID_EMAIL) {
        setSubmitError(t("LandingScreen.INVALID_EMAIL_LOGIN"));
        return;
      }

      setSubmitError(t("LandingScreen.INVALID_PASSWORD_LOGIN"));
      return;
    }

    setSubmitError(t("Common.UNFORESEEN_ERROR"));
  };

  const onSubmit = async () => {
    setSubmitError("");

    try {
      await mutateAsync(credentials);
    } catch (error) {
      handleSubmitError(error);
    }
  };

  return (
    <LoginScreen
      email={credentials.email}
      onChangeEmail={getInputChangeHandler({ input: "email" })}
      password={credentials.password}
      onChangePassword={getInputChangeHandler({ input: "password" })}
      isPasswordVisible={isPasswordVisible}
      canSubmit={canSubmit}
      isSubmitting={isPending}
      submitError={submitError}
      onTogglePasswordVisibility={handleTogglePasswordVisibility}
      onSubmit={onSubmit}
      onPressClose={navigation.goBack}
    />
  );
};

export default LoginScreenContainer;
