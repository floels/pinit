import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import { Colors } from "@/src/global.styles";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/src/lib/constants";
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
