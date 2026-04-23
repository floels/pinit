import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export type AuthContextType = {
  accessToken: string | null;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
  isAuthInitialized: boolean;
  setIsAuthInitialized: Dispatch<SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  isAuthInitialized: false,
  setIsAuthInitialized: () => {},
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, isAuthInitialized, setIsAuthInitialized }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
