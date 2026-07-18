import { NavigationProp } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import LoginScreen from "./LoginScreen";

import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  API_BASE_URL,
  API_ENDPOINT_OBTAIN_TOKEN,
  ERROR_CODE_INVALID_EMAIL,
} from "@/src/lib/constants";
import { Response401Error } from "@/src/lib/customErrors";
import { persistTokensData } from "@/src/lib/utils/authentication";
import { throwIfKO } from "@/src/lib/utils/fetch";
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

const fetchTokens = async ({ email, password }: Credentials) => {
  const response = await fetch(`${API_BASE_URL}/${API_ENDPOINT_OBTAIN_TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (response.status === 401) {
    const responseData = await response.json();

    const errorMessage = responseData.errors?.[0]?.code;

    throw new Response401Error(errorMessage);
  }

  throwIfKO(response);

  const responseData = await response.json();

  return responseData;
};

const LoginScreenContainer = ({ navigation }: LoginScreenContainerProps) => {
  const { t } = useTranslation();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { dispatch } = useAuthenticationContext();

  const handleTogglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getInputChangeHandler =
    ({ input }: { input: "email" | "password" }) =>
    (newValue: string) => {
      const newCredentials = { ...credentials, [input]: newValue };
      setCredentials(newCredentials);

      const newCanSubmit = computeCanSubmit(newCredentials);
      setCanSubmit(newCanSubmit);
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
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const {
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expiration_utc: accessTokenExpirationDate,
      } = await fetchTokens(credentials);

      await persistTokensData({
        accessToken,
        refreshToken,
        accessTokenExpirationDate,
      });

      dispatch({ type: "LOGGED_IN" });
    } catch (error) {
      handleSubmitError(error);
    } finally {
      setIsSubmitting(false);
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
      isSubmitting={isSubmitting}
      submitError={submitError}
      onTogglePasswordVisibility={handleTogglePasswordVisibility}
      onSubmit={onSubmit}
      onPressClose={navigation.goBack}
    />
  );
};

export default LoginScreenContainer;
