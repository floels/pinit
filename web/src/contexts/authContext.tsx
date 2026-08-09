import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  REFRESH_ACCESS_TOKEN_QUERY_KEY,
  fetchRefreshedAccessToken,
} from "@/lib/api/refreshAccessToken";

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
  isAuthInitialized: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  isAuthInitialized: false,
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

  const contextValue = {
    accessToken,
    setAccessToken: setExplicitAccessToken,
    isAuthInitialized,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
