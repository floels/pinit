import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import {
  REFRESH_ACCESS_TOKEN_QUERY_KEY,
  fetchRefreshedAccessToken,
} from "@/lib/api/refreshAccessToken";

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  isAuthInitialized: boolean;
  // True while the app is asking the user to log back in, which happens when a
  // session ends without the user asking for it. Two components read it:
  //   - 'HeaderUnauthenticated' opens the login modal when it is true.
  //   - 'PinCreationToolPage' holds its URL while it is true, so a successful
  //     login lands the user back on the page they were using.
  isPromptingLogin: boolean;
  // Ends the session locally and asks the user for nothing. No request, and no
  // navigation. Logout calls this one: the user asked to leave, so no prompt.
  clearSession: () => void;
  // 'clearSession', and then ask for a new login. A failed refresh calls this.
  endSession: () => void;
  // The user declined to log back in. Stopping the prompt releases the route
  // guards, so an authenticated-only route redirects home again.
  stopPromptingLogin: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  isAuthInitialized: false,
  isPromptingLogin: false,
  clearSession: () => {},
  endSession: () => {},
  stopPromptingLogin: () => {},
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // `undefined` means that no token was set explicitly yet. The token then comes
  // from the refresh query below. Login, logout and token refresh all set an
  // explicit value, which takes precedence over the query result.
  const [explicitAccessToken, setExplicitAccessToken] = useState<
    string | null | undefined
  >(undefined);

  const [isPromptingLogin, setIsPromptingLogin] = useState(false);

  const { data, status } = useQuery({
    queryKey: REFRESH_ACCESS_TOKEN_QUERY_KEY,
    queryFn: fetchRefreshedAccessToken,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const accessToken =
    explicitAccessToken !== undefined
      ? explicitAccessToken
      : (data?.access_token ?? null);

  const isAuthInitialized = status === "success" || status === "error";

  const setAccessToken = (newAccessToken: string | null) => {
    setExplicitAccessToken(newAccessToken);

    // A token means that somebody logged in, so there is nothing left to ask.
    if (newAccessToken !== null) {
      setIsPromptingLogin(false);
    }
  };

  // The three functions below are the only ways a session ends. They differ in
  // one thing: whether the app then asks the user to log back in.

  const clearSession = () => {
    setExplicitAccessToken(null);

    // The cached display data belongs to the account that is leaving. Without
    // this, the header of the next account to log in shows the previous
    // username and profile picture until '/accounts/me/' resolves.
    localStorage?.removeItem(USERNAME_LOCAL_STORAGE_KEY);
    localStorage?.removeItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY);
  };

  // A refresh fails only when the refresh token is gone, expired or revoked. So
  // the session is over through no choice of the user, and the app asks them to
  // log back in rather than moving them elsewhere.
  const endSession = () => {
    clearSession();
    setIsPromptingLogin(true);
  };

  const stopPromptingLogin = () => {
    setIsPromptingLogin(false);
  };

  const contextValue = {
    accessToken,
    setAccessToken,
    isAuthInitialized,
    isPromptingLogin,
    clearSession,
    endSession,
    stopPromptingLogin,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
