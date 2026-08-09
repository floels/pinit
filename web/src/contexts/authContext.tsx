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
  // True from the moment a reactive refresh fails until the user logs back in
  // or dismisses the prompt. It is what makes the login modal open itself, and
  // what tells an authenticated-only route to hold its URL instead of
  // redirecting home.
  sessionExpired: boolean;
  // Ends the session locally: no request, and no navigation. Logout calls this
  // one, because a logout is not an expiry.
  clearSession: () => void;
  // 'clearSession' plus the 'sessionExpired' flag. A failed refresh calls this.
  endSession: () => void;
  clearSessionExpiry: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  isAuthInitialized: false,
  sessionExpired: false,
  clearSession: () => {},
  endSession: () => {},
  clearSessionExpiry: () => {},
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

  const [sessionExpired, setSessionExpired] = useState(false);

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
      setSessionExpired(false);
    }
  };

  const clearSession = () => {
    setExplicitAccessToken(null);

    // The cached display data belongs to the account that is leaving. Without
    // this, the header of the next account to log in shows the previous
    // username and profile picture until '/accounts/me/' resolves.
    localStorage?.removeItem(USERNAME_LOCAL_STORAGE_KEY);
    localStorage?.removeItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY);
  };

  const endSession = () => {
    clearSession();
    setSessionExpired(true);
  };

  const clearSessionExpiry = () => {
    setSessionExpired(false);
  };

  const contextValue = {
    accessToken,
    setAccessToken,
    isAuthInitialized,
    sessionExpired,
    clearSession,
    endSession,
    clearSessionExpiry,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
