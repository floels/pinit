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
      dispatch({ type: "CHECKED_NO_ACCESS_TOKEN" });
      return;
    }

    if (!accessToken) {
      dispatch({ type: "CHECKED_NO_ACCESS_TOKEN" });
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
      dispatch({ type: "CHECKED_NO_ACCESS_TOKEN" });
      return;
    }

    dispatch({ type: "FOUND_ACCESS_TOKEN" });
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
