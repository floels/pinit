import { useAuthContext } from "@/contexts/authContext";
import AccessTokenRefresher from "./AccessTokenRefresher";
import AccountDetailsFetcher from "./AccountDetailsFetcher";

const AuthBootstrap = () => {
  const { accessToken, isAuthInitialized } = useAuthContext();

  if (!isAuthInitialized) {
    return <AccessTokenRefresher />;
  }

  if (!accessToken) {
    return null;
  }

  return <AccountDetailsFetcher />;
};

export default AuthBootstrap;
