import { createContext, useContext, useEffect, useReducer } from "react";
import {
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { refreshAccessToken } from "@/lib/api/refreshAccessToken";

// The four auth states, as one value. Three independent variables would allow
// eight combinations, and only these four are legal: a token cannot coexist with
// a login prompt, and no token can exist before the startup refresh settles.
// See 'doc/authentication.md'.
type State =
  | { status: "initializing" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; accessToken: string }
  | { status: "expired" };

type Action =
  | { type: "STARTUP_REFRESH_SETTLED"; accessToken: string | null }
  | { type: "TOKEN_OBTAINED"; accessToken: string }
  | { type: "SESSION_CLEARED" }
  | { type: "SESSION_EXPIRED" }
  | { type: "LOGIN_PROMPT_DECLINED" };

export type AuthenticationContextType = {
  accessToken: string | null;
  // A login, a signup, or a refresh after a 401 supplies a token. Nobody passes
  // null: 'clearSession' and 'endSession' end a session instead.
  setAccessToken: (accessToken: string) => void;
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
  // Ends the session, and then asks for a new login. A failed refresh calls this.
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

const initialState: State = { status: "initializing" };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "STARTUP_REFRESH_SETTLED":
      // A login can land while the startup request is still open, on a slow
      // network. Whoever acted explicitly wins, so a late answer is stale.
      if (state.status !== "initializing") {
        return state;
      }

      return action.accessToken
        ? { status: "authenticated", accessToken: action.accessToken }
        : { status: "unauthenticated" };

    case "TOKEN_OBTAINED":
      return { status: "authenticated", accessToken: action.accessToken };

    // 'SESSION_CLEARED' and 'LOGIN_PROMPT_DECLINED' produce the same state. They
    // stay separate because they say why the session ended, which a reader of a
    // call site needs to know.
    case "SESSION_CLEARED":
      return { status: "unauthenticated" };

    case "SESSION_EXPIRED":
      return { status: "expired" };

    case "LOGIN_PROMPT_DECLINED":
      // Only an expired session prompts a login. Without this guard, a stray
      // call would end a healthy session.
      if (state.status !== "expired") {
        return state;
      }

      return { status: "unauthenticated" };
  }
};

export const AuthenticationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // The access token lives in memory only, so a reload takes it with it. The app
  // therefore asks the backend once, on mount, who the user is. The browser
  // attaches the httpOnly refresh cookie. This is the only place that starts a
  // session without the user acting.
  useEffect(() => {
    const runStartupRefresh = async () => {
      const refreshedData = await refreshAccessToken();

      dispatch({
        type: "STARTUP_REFRESH_SETTLED",
        accessToken: refreshedData?.access_token ?? null,
      });
    };

    runStartupRefresh();
  }, []);

  const setAccessToken = (accessToken: string) => {
    dispatch({ type: "TOKEN_OBTAINED", accessToken });
  };

  // The cached display data belongs to the account that is leaving. Without
  // this, the header of the next account to log in shows the previous username
  // and profile picture until '/accounts/me/' resolves.
  const clearCachedAccountData = () => {
    localStorage?.removeItem(USERNAME_LOCAL_STORAGE_KEY);
    localStorage?.removeItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY);
  };

  // The two functions below are the only ways a session ends. They differ in one
  // thing: whether the app then asks the user to log back in. The reducer stays
  // pure, so both clear the cached data here.

  const clearSession = () => {
    dispatch({ type: "SESSION_CLEARED" });
    clearCachedAccountData();
  };

  // A refresh fails only when the refresh token is gone, expired or revoked. So
  // the session is over through no choice of the user, and the app asks them to
  // log back in rather than moving them elsewhere.
  const endSession = () => {
    dispatch({ type: "SESSION_EXPIRED" });
    clearCachedAccountData();
  };

  const stopPromptingLogin = () => {
    dispatch({ type: "LOGIN_PROMPT_DECLINED" });
  };

  const contextValue = {
    accessToken: state.status === "authenticated" ? state.accessToken : null,
    setAccessToken,
    isAuthInitialized: state.status !== "initializing",
    isPromptingLogin: state.status === "expired",
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
