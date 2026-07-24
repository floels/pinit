import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  REFRESH_ACCESS_TOKEN_QUERY_KEY,
  fetchRefreshedAccessToken,
} from "@/lib/utils/refreshAccessToken";

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const { data, status } = useQuery({
    queryKey: REFRESH_ACCESS_TOKEN_QUERY_KEY,
    queryFn: fetchRefreshedAccessToken,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (status === "success") {
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }
      setIsAuthInitialized(true);
    } else if (status === "error") {
      setIsAuthInitialized(true);
    }
  }, [status, data]);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, isAuthInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
