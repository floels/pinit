import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { refreshAccessToken } from "@/lib/api/refreshAccessToken";

export type AuthenticationContextType = {
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

export const AuthenticationContext = createContext<AuthenticationContextType>({
  accessToken: null,
  setAccessToken: () => {},
  isAuthInitialized: false,
  isPromptingLogin: false,
  clearSession: () => {},
  endSession: () => {},
  stopPromptingLogin: () => {},
});

export const AuthenticationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [isPromptingLogin, setIsPromptingLogin] = useState(false);

  // True once a login, a logout or an on-401 refresh has set the token. The
  // startup refresh below then leaves the token alone: a user who logged in
  // while that request was still open must stay logged in.
  const hasExplicitToken = useRef(false);

  const setAccessToken = (newAccessToken: string | null) => {
    hasExplicitToken.current = true;
    setAccessTokenState(newAccessToken);

    // A token means that somebody logged in, so there is nothing left to ask.
    if (newAccessToken !== null) {
      setIsPromptingLogin(false);
    }
  };

  // The access token lives in memory only, so a reload takes it with it. The app
  // therefore asks the backend once, on mount, who the user is. The browser
  // attaches the httpOnly refresh cookie. This is the only place that starts a
  // session without the user acting.
  useEffect(() => {
    const runStartupRefresh = async () => {
      const refreshedData = await refreshAccessToken();

      if (!hasExplicitToken.current) {
        setAccessTokenState(refreshedData?.access_token ?? null);
      }

      setIsAuthInitialized(true);
    };

    runStartupRefresh();
  }, []);

  // The three functions below are the only ways a session ends. They differ in
  // one thing: whether the app then asks the user to log back in.

  const clearSession = () => {
    setAccessToken(null);

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
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthenticationContext = () => useContext(AuthenticationContext);
