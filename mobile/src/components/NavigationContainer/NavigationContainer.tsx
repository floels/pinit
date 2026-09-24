import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import { Colors } from "@/src/global.styles";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/src/lib/constants";
import {
  clearStoredAuthData,
  ensureFreshAccessToken,
} from "@/src/lib/utils/authentication";
import AuthenticatedNavigator from "@/src/navigators/AuthenticatedNavigator/AuthenticatedNavigator";
import UnauthenticatedNavigator from "@/src/navigators/UnauthenticatedNavigator/UnauthenticatedNavigator";

const NavigatorContainer = () => {
  const { state, dispatch } = useAuthenticationContext();

  const { isCheckingAccessToken, isAuthenticated } = state;

  const checkAccessToken = async () => {
    let accessToken;

    try {
      accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_STORAGE_KEY);
    } catch {
      dispatch({ type: "SESSION_ABSENT" });
      return;
    }

    if (!accessToken) {
      dispatch({ type: "SESSION_ABSENT" });
      return;
    }

    // Refresh the token (if it's near expiry) *before* entering the
    // authenticated tree, so authenticated screens never fire a request with a
    // stale token and get logged out by a spurious 401. If the session can't be
    // refreshed, clear the stale tokens and go to the login screen instead of
    // flashing the authenticated UI and bouncing back.
    let hasValidSession;

    try {
      hasValidSession = await ensureFreshAccessToken();
    } catch {
      hasValidSession = false;
    }

    if (!hasValidSession) {
      await clearStoredAuthData();
      dispatch({ type: "SESSION_ABSENT" });
      return;
    }

    dispatch({ type: "SESSION_RESTORED" });
  };

  useEffect(() => {
    checkAccessToken();
  }, []);

  if (isCheckingAccessToken) {
    return null;
  }

  // See https://reactnavigation.org/docs/themes/#basic-usage
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.backgroundBase,
    },
  };

  return (
    <NavigationContainer theme={theme}>
      {isAuthenticated ? (
        <AuthenticatedNavigator />
      ) : (
        <UnauthenticatedNavigator />
      )}
    </NavigationContainer>
  );
};

export default NavigatorContainer;
