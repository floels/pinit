import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL_REFRESH_TOKEN } from "@/lib/constants";

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

  const fetchRefreshedAccessToken = async () => {
    const response = await fetch(API_URL_REFRESH_TOKEN, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  };

  const { data, status } = useQuery({
    queryKey: ["refreshAccessToken"],
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
