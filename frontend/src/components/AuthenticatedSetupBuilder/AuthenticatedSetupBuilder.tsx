import { useAuthContext } from "@/contexts/authContext";
import AccessTokenRefresher from "./AccessTokenRefresher";
import AccountDetailsFetcher from "./AccountDetailsFetcher";

const AuthenticatedSetupBuilder = () => {
  const { accessToken, isAuthInitialized } = useAuthContext();

  if (!isAuthInitialized) {
    return <AccessTokenRefresher />;
  }

  if (!accessToken) {
    return null;
  }

  return <AccountDetailsFetcher />;
};

export default AuthenticatedSetupBuilder;
