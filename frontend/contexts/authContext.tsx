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
};

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
